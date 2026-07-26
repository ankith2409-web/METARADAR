import json
import logging
from typing import List, Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Query, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from apscheduler.schedulers.background import BackgroundScheduler


from app.config import settings
from app.database import (
    init_db, get_db, SignalModel, AgentTraceModel, ExposureRoutingModel,
    NarrativeThreadModel, InflectionEventModel, BattleCardModel, ValidationLogModel
)
from app.schemas import (
    SignalResponse, SignalListResponse, AgentTraceResponse, ExposureRoutingResponse,
    NarrativeThreadResponse, InflectionEventResponse, BattleCardResponse,
    ValidationReportResponse, ScoutOutput, AnalystOutput, StrategistOutput
)
from app.ingestion.replay_data import REPLAY_SIGNALS
from app.ingestion.pubmed_client import PubMedClient
from app.ingestion.clinicaltrials_client import ClinicalTrialsClient
from app.ingestion.rss_client import RSSClient
from app.ingestion.deduplicator import Deduplicator
from app.agents.scoring_chain import MultiAgentScoringChain
from app.analytics.narrative_threading import NarrativeThreadingService
from app.analytics.inflection_detector import InflectionDetector
from app.analytics.retroactive_validation import RetroactiveValidationService
from app.analytics.battle_cards import BattleCardService
from app.exposure.franchise_map import FRANCHISE_MAP
from app.exposure.exposure_reference import PEAK_ESTIMATE_REFERENCE
from app.security import SecurityHeadersMiddleware, RateLimiter, InputSanitizer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("metaradar.main")

rate_limiter = RateLimiter(requests_per_minute=120)


scheduler = BackgroundScheduler()


def scheduled_ingestion_job():
    logger.info("Executing scheduled background signal ingestion job...")
    db_gen = get_db()
    db = next(db_gen)
    try:
        trigger_ingestion(source="all", db=db)
    except Exception as e:
        logger.error(f"Error during scheduled background ingestion: {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    db = next(get_db())
    try:
        count = db.query(SignalModel).count()
        if count == 0:
            logger.info("Initializing MetaRadar database with replay dataset...")
            _seed_replay_signals(db)
            NarrativeThreadingService.generate_threads(db)
            InflectionDetector.calculate_inflections(db)
            BattleCardService.initialize_battle_cards(db)
            RetroactiveValidationService.get_report(db)
            logger.info("Database initialization complete.")
    except Exception as e:
        logger.error(f"Error during database startup seed: {e}")
    finally:
        db.close()

    try:
        scheduler.add_job(scheduled_ingestion_job, "interval", minutes=60)
        scheduler.start()
        logger.info("APScheduler background ingestion service started successfully.")
    except Exception as e:
        logger.warning(f"Failed to start background scheduler: {e}")

    yield

    try:
        scheduler.shutdown(wait=False)
        logger.info("APScheduler background ingestion service shut down.")
    except Exception:
        pass


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="MetaRadar AI-Powered Competitive Intelligence API",
    lifespan=lifespan
)

# Security Headers & OWASP Middleware
app.add_middleware(SecurityHeadersMiddleware)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "127.0.0.1"
    allowed, remaining = rate_limiter.is_allowed(client_ip)
    if not allowed:
        logger.warning(f"Security Alert: Rate limit exceeded for IP {client_ip}")
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Rate limit exceeded (120 req/min limit). Security throttling enforced."}
        )
    response: Response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = "120"
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    return response



@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected internal server error occurred.", "error": str(exc)}
    )


def _seed_replay_signals(db: Session):
    for sig_data in REPLAY_SIGNALS:
        scout_out, analyst_out, strategist_out, exposure_out, is_fallback = (
            MultiAgentScoringChain.evaluate_signal(
                sig_data["title"], sig_data["summary"], sig_data["source"]
            )
        )

        signal = SignalModel(
            external_id=sig_data["external_id"],
            title=sig_data["title"],
            summary=sig_data["summary"],
            source=sig_data["source"],
            url=sig_data["url"],
            doi=sig_data.get("doi"),
            published_date=sig_data["published_date"],
            competitor=sig_data["competitor"],
            therapeutic_area=sig_data["therapeutic_area"],
            threat_level=sig_data["threat_level"],
            relevance_score=sig_data["relevance_score"],
            rationale=sig_data["rationale"],
            recommended_action=sig_data["recommended_action"],
            action_justification=sig_data["action_justification"],
            is_replay=True
        )
        db.add(signal)
        db.commit()
        db.refresh(signal)

        trace = AgentTraceModel(
            signal_id=signal.id,
            scout_output=json.dumps(scout_out),
            analyst_output=json.dumps(analyst_out),
            strategist_output=json.dumps(strategist_out),
            is_fallback=is_fallback
        )
        db.add(trace)

        exp_record = ExposureRoutingModel(
            signal_id=signal.id,
            franchise_overlap=exposure_out["franchise_overlap"],
            exposure_bucket=exposure_out["exposure_bucket"],
            exposure_range_illustrative=exposure_out.get("exposure_range_illustrative"),
            exposure_source_citation=exposure_out.get("exposure_source_citation"),
            exposure_methodology_note=exposure_out["exposure_methodology_note"],
            routing_owner=exposure_out["routing_owner"],
            routing_deadline_note=exposure_out["routing_deadline_note"]
        )
        db.add(exp_record)
        db.commit()


@app.get("/api/health")
def health_check():
    has_key = bool(settings.OPENAI_API_KEY.strip() or settings.ANTHROPIC_API_KEY.strip())
    is_live = has_key and not settings.USE_MOCK_FALLBACK
    return {
        "status": "healthy",
        "service": "MetaRadar API",
        "version": settings.VERSION,
        "ai_api_key_configured": has_key,
        "ai_mode": "Live AI API (Active)" if is_live else "Deterministic Engine (Fallback)",
        "notification": "🟢 Live AI API Key Active" if is_live else "🔵 Deterministic Engine Active (Offline Fallback Mode)"
    }


@app.get("/api/status")
def get_system_status():
    has_openai = bool(settings.OPENAI_API_KEY.strip())
    has_anthropic = bool(settings.ANTHROPIC_API_KEY.strip())
    has_key = has_openai or has_anthropic
    is_live = has_key and not settings.USE_MOCK_FALLBACK

    provider = "OpenAI" if has_openai else ("Anthropic" if has_anthropic else "None")
    active_key = settings.OPENAI_API_KEY if has_openai else settings.ANTHROPIC_API_KEY
    masked_key = InputSanitizer.mask_api_key(active_key)

    return {
        "has_api_key": has_key,
        "provider": provider,
        "masked_key": masked_key,
        "is_live_ai": is_live,
        "use_mock_fallback": settings.USE_MOCK_FALLBACK,
        "status_badge": "LIVE_AI" if is_live else "FALLBACK",
        "notification_title": "Live AI API Active" if is_live else "Deterministic Engine Active",
        "notification_message": (
            f"Using live {provider} API key ({masked_key}) for scoring & synthesis."
            if is_live else
            "No active API key set. Running on local zero-dependency deterministic engine. Paste key in settings to activate Live LLM API."
        ),
        "security_audit": {
            "security_status": "ENTERPRISE_HARDENED",
            "owasp_headers_active": True,
            "rate_limiter_active": True,
            "rate_limit_max": "120 requests/min",
            "input_sanitization": "Active (XSS/SQLi Guarded)",
            "key_masking": "Active (Secrets Never Exported)",
            "strict_dollar_guardrail": "Active (No un-cited financial estimates allowed)"
        }
    }


class APIKeyUpdateRequest(BaseModel):
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None


@app.post("/api/config/api-key")
def update_api_key(payload: APIKeyUpdateRequest):
    target_key = None
    if payload.openai_api_key and payload.openai_api_key.strip():
        target_key = payload.openai_api_key.strip()
        if not InputSanitizer.validate_api_key(target_key):
            raise HTTPException(
                status_code=400,
                detail="Security Error: Invalid OpenAI API key format. Key must start with sk- or sk-proj- and be well-formed."
            )
        settings.OPENAI_API_KEY = target_key
        settings.USE_MOCK_FALLBACK = False
    elif payload.anthropic_api_key and payload.anthropic_api_key.strip():
        target_key = payload.anthropic_api_key.strip()
        if not InputSanitizer.validate_api_key(target_key):
            raise HTTPException(
                status_code=400,
                detail="Security Error: Invalid Anthropic API key format. Key must start with sk-ant- and be well-formed."
            )
        settings.ANTHROPIC_API_KEY = target_key
        settings.USE_MOCK_FALLBACK = False

    has_key = bool(settings.OPENAI_API_KEY.strip() or settings.ANTHROPIC_API_KEY.strip())
    is_live = has_key and not settings.USE_MOCK_FALLBACK

    return {
        "success": True,
        "has_api_key": has_key,
        "is_live_ai": is_live,
        "masked_key": InputSanitizer.mask_api_key(target_key or ""),
        "message": "AI API Key validated and saved! Live AI reasoning pipeline is active." if is_live else "Fallback mode active."
    }




def _format_exposure_response(exp: Optional[ExposureRoutingModel]) -> Optional[ExposureRoutingResponse]:
    if not exp:
        return None
    return ExposureRoutingResponse(
        id=exp.id,
        signal_id=exp.signal_id,
        franchise_overlap=exp.franchise_overlap,
        exposure_bucket=exp.exposure_bucket,
        exposure_range_illustrative=exp.exposure_range_illustrative,
        exposure_source_citation=exp.exposure_source_citation,
        exposure_methodology_note=exp.exposure_methodology_note,
        routing_owner=exp.routing_owner,
        routing_deadline_note=exp.routing_deadline_note,
        computed_at=exp.computed_at
    )


@app.get("/api/signals", response_model=SignalListResponse)
def get_signals(
    competitor: Optional[str] = Query(None, description="Filter by competitor name"),
    threat_level: Optional[str] = Query(None, description="Filter by threat level"),
    source: Optional[str] = Query(None, description="Filter by data source"),
    search: Optional[str] = Query(None, description="Search term in title or summary"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(SignalModel).filter(SignalModel.relevance_score > 1)
    if competitor:
        query = query.filter(SignalModel.competitor.ilike(f"%{competitor}%"))
    if threat_level:
        query = query.filter(SignalModel.threat_level == threat_level.lower())
    if source:
        query = query.filter(SignalModel.source.ilike(f"%{source}%"))
    if search:
        query = query.filter(
            (SignalModel.title.ilike(f"%{search}%")) | (SignalModel.summary.ilike(f"%{search}%"))
        )

    total = query.count()
    signals = query.order_by(SignalModel.id.desc()).offset(offset).limit(limit).all()


    formatted_signals = []
    for s in signals:
        trace_resp = None
        exp_resp = _format_exposure_response(s.exposure_routing)

        if s.trace:
            trace_resp = AgentTraceResponse(
                id=s.trace.id,
                signal_id=s.trace.signal_id,
                scout_output=ScoutOutput(**json.loads(s.trace.scout_output)),
                analyst_output=AnalystOutput(**json.loads(s.trace.analyst_output)),
                strategist_output=StrategistOutput(
                    **json.loads(s.trace.strategist_output)
                ),
                exposure_routing=exp_resp,
                is_fallback=s.trace.is_fallback,
                created_at=s.trace.created_at
            )

        formatted_signals.append(SignalResponse(
            id=s.id,
            external_id=s.external_id,
            title=s.title,
            summary=s.summary,
            source=s.source,
            url=s.url,
            doi=s.doi,
            published_date=s.published_date,
            competitor=s.competitor,
            therapeutic_area=s.therapeutic_area,
            threat_level=s.threat_level,
            relevance_score=s.relevance_score,
            rationale=s.rationale,
            recommended_action=s.recommended_action,
            action_justification=s.action_justification,
            ingested_at=s.ingested_at,
            is_replay=s.is_replay,
            trace=trace_resp,
            exposure_routing=exp_resp
        ))

    return SignalListResponse(total=total, signals=formatted_signals)


@app.get("/api/signals/{signal_id}/trace", response_model=AgentTraceResponse)
def get_signal_trace(signal_id: int, db: Session = Depends(get_db)):
    trace = db.query(AgentTraceModel).filter(
        AgentTraceModel.signal_id == signal_id
    ).first()
    if not trace:
        raise HTTPException(
            status_code=404, detail="Agent trace not found for this signal"
        )

    sig = db.query(SignalModel).filter(SignalModel.id == signal_id).first()
    exp_resp = _format_exposure_response(sig.exposure_routing if sig else None)

    return AgentTraceResponse(
        id=trace.id,
        signal_id=trace.signal_id,
        scout_output=ScoutOutput(**json.loads(trace.scout_output)),
        analyst_output=AnalystOutput(**json.loads(trace.analyst_output)),
        strategist_output=StrategistOutput(**json.loads(trace.strategist_output)),
        exposure_routing=exp_resp,
        is_fallback=trace.is_fallback,
        created_at=trace.created_at
    )


@app.get("/api/routing-queue", response_model=List[SignalResponse])
def get_routing_queue(
    owner: Optional[str] = Query(None, description="Filter by owning function (Market Access, Commercial Strategy, BD&L, Medical Affairs)"),
    db: Session = Depends(get_db)
):
    query = db.query(SignalModel).join(SignalModel.exposure_routing)
    if owner and owner.upper() != "ALL":
        query = query.filter(ExposureRoutingModel.routing_owner.ilike(f"%{owner}%"))

    signals = query.all()

    # Sort by exposure bucket (High > Medium > Low) then published date
    bucket_order = {"High": 0, "Medium": 1, "Low": 2}
    signals.sort(
        key=lambda s: (
            bucket_order.get(s.exposure_routing.exposure_bucket if s.exposure_routing else "Low", 3),
            s.published_date
        ),
        reverse=False
    )

    results = []
    for s in signals:
        exp_resp = _format_exposure_response(s.exposure_routing)
        trace_resp = None
        if s.trace:
            trace_resp = AgentTraceResponse(
                id=s.trace.id,
                signal_id=s.trace.signal_id,
                scout_output=ScoutOutput(**json.loads(s.trace.scout_output)),
                analyst_output=AnalystOutput(**json.loads(s.trace.analyst_output)),
                strategist_output=StrategistOutput(**json.loads(s.trace.strategist_output)),
                exposure_routing=exp_resp,
                is_fallback=s.trace.is_fallback,
                created_at=s.trace.created_at
            )

        results.append(SignalResponse(
            id=s.id,
            external_id=s.external_id,
            title=s.title,
            summary=s.summary,
            source=s.source,
            url=s.url,
            doi=s.doi,
            published_date=s.published_date,
            competitor=s.competitor,
            therapeutic_area=s.therapeutic_area,
            threat_level=s.threat_level,
            relevance_score=s.relevance_score,
            rationale=s.rationale,
            recommended_action=s.recommended_action,
            action_justification=s.action_justification,
            ingested_at=s.ingested_at,
            is_replay=s.is_replay,
            trace=trace_resp,
            exposure_routing=exp_resp
        ))

    return results


@app.get("/api/franchise-map")
def get_franchise_map_endpoint():
    return {
        "franchise_map": FRANCHISE_MAP,
        "peak_estimates": PEAK_ESTIMATE_REFERENCE
    }



@app.get("/api/threads", response_model=List[NarrativeThreadResponse])
def get_narrative_threads(db: Session = Depends(get_db)):
    threads = db.query(NarrativeThreadModel).all()
    if not threads:
        threads = NarrativeThreadingService.generate_threads(db)

    results = []
    for t in threads:
        sig_ids = json.loads(t.signal_ids_json)
        signals = db.query(SignalModel).filter(SignalModel.id.in_(sig_ids)).all()

        formatted_sigs = [
            SignalResponse(
                id=s.id, external_id=s.external_id, title=s.title,
                summary=s.summary, source=s.source, url=s.url, doi=s.doi,
                published_date=s.published_date, competitor=s.competitor,
                therapeutic_area=s.therapeutic_area, threat_level=s.threat_level,
                relevance_score=s.relevance_score, rationale=s.rationale,
                recommended_action=s.recommended_action,
                action_justification=s.action_justification,
                ingested_at=s.ingested_at, is_replay=s.is_replay, trace=None
            ) for s in signals
        ]

        results.append(NarrativeThreadResponse(
            id=t.id,
            competitor=t.competitor,
            title=t.title,
            narrative_summary=t.narrative_summary,
            signal_ids=sig_ids,
            signal_count=t.signal_count,
            time_window_days=t.time_window_days,
            signals=formatted_sigs
        ))
    return results


@app.get("/api/inflections", response_model=List[InflectionEventResponse])
def get_inflections(db: Session = Depends(get_db)):
    events = db.query(InflectionEventModel).all()
    if not events or len(events) < 20:
        events = InflectionDetector.calculate_inflections(db)
    return events



@app.get("/api/battle-cards", response_model=List[BattleCardResponse])
def get_battle_cards(db: Session = Depends(get_db)):
    cards = db.query(BattleCardModel).all()
    if not cards:
        cards = BattleCardService.initialize_battle_cards(db)

    results = []
    for c in cards:
        results.append(BattleCardResponse(
            id=c.id,
            competitor=c.competitor,
            canonical_name=c.canonical_name,
            lead_asset=c.lead_asset,
            mechanism=c.mechanism,
            pipeline_stage=c.pipeline_stage,
            threat_assessment=c.threat_assessment,
            recent_moves=json.loads(c.recent_moves_json),
            key_threats=json.loads(c.key_threats_json),
            market_position=c.market_position,
            updated_at=c.updated_at
        ))
    return results


@app.get("/api/validation-report", response_model=ValidationReportResponse)
def get_validation_report(db: Session = Depends(get_db)):
    report_data = RetroactiveValidationService.get_report(db)
    hist_signals = db.query(SignalModel).filter(
        SignalModel.competitor == "Eli Lilly"
    ).limit(3).all()

    formatted_sigs = [
        SignalResponse(
            id=s.id, external_id=s.external_id, title=s.title, summary=s.summary,
            source=s.source, url=s.url, doi=s.doi, published_date=s.published_date,
            competitor=s.competitor, therapeutic_area=s.therapeutic_area,
            threat_level=s.threat_level, relevance_score=s.relevance_score,
            rationale=s.rationale, recommended_action=s.recommended_action,
            action_justification=s.action_justification, ingested_at=s.ingested_at,
            is_replay=s.is_replay, trace=None
        ) for s in hist_signals
    ]

    return ValidationReportResponse(
        title=report_data["title"],
        event_name=report_data["event_name"],
        event_date=report_data["event_date"],
        flagged_date=report_data["flagged_date"],
        lead_time_days=report_data["lead_time_days"],
        competitor=report_data["competitor"],
        summary=report_data["summary"],
        historical_signals=formatted_sigs
    )


@app.post("/api/ingest/trigger")
def trigger_ingestion(source: str = "all", db: Session = Depends(get_db)):
    dedup = Deduplicator()
    existing_signals = db.query(SignalModel).all()
    for s in existing_signals:
        dedup.register(title=s.title, url=s.url, doi=s.doi)

    new_raw = []
    if source in ["all", "pubmed"]:
        new_raw.extend(PubMedClient.fetch_recent_signals())
    if source in ["all", "clinicaltrials"]:
        new_raw.extend(ClinicalTrialsClient.fetch_recent_signals())
    if source in ["all", "rss"]:
        new_raw.extend(RSSClient.fetch_recent_signals())

    added_count = 0
    for item in new_raw:
        if dedup.is_exact_duplicate(url=item.get("url"), doi=item.get("doi")) or dedup.is_near_duplicate(item.get("title")):
            continue

        scout_out, analyst_out, strategist_out, exposure_out, is_fallback = (
            MultiAgentScoringChain.evaluate_signal(
                item["title"], item["summary"], item["source"]
            )
        )

        competitor_name = (
            analyst_out["competitors"][0]
            if analyst_out.get("competitors")
            else item.get("competitor", "Other Pharma")
        )

        signal = SignalModel(
            external_id=item.get("external_id"),
            title=item["title"],
            summary=item["summary"],
            source=item["source"],
            url=item.get("url"),
            published_date=item.get("published_date", "2026-07-20"),
            competitor=competitor_name,
            therapeutic_area=analyst_out.get(
                "therapeutic_area", item.get("therapeutic_area", "Metabolic Disease")
            ),
            threat_level=analyst_out.get(
                "threat_level", item.get("threat_level", "medium")
            ),
            relevance_score=analyst_out.get(
                "relevance_score", item.get("relevance_score", 5)
            ),
            rationale=analyst_out.get("rationale"),
            recommended_action=strategist_out.get("recommended_action"),
            action_justification=strategist_out.get("justification"),
            is_replay=False
        )
        db.add(signal)
        db.commit()
        db.refresh(signal)

        trace = AgentTraceModel(
            signal_id=signal.id,
            scout_output=json.dumps(scout_out),
            analyst_output=json.dumps(analyst_out),
            strategist_output=json.dumps(strategist_out),
            is_fallback=is_fallback
        )
        db.add(trace)

        exp_record = ExposureRoutingModel(
            signal_id=signal.id,
            franchise_overlap=exposure_out["franchise_overlap"],
            exposure_bucket=exposure_out["exposure_bucket"],
            exposure_range_illustrative=exposure_out.get("exposure_range_illustrative"),
            exposure_source_citation=exposure_out.get("exposure_source_citation"),
            exposure_methodology_note=exposure_out["exposure_methodology_note"],
            routing_owner=exposure_out["routing_owner"],
            routing_deadline_note=exposure_out["routing_deadline_note"]
        )
        db.add(exp_record)
        db.commit()


        dedup.register(
            title=item["title"], url=item.get("url"), doi=item.get("doi")
        )
        added_count += 1

    return {"status": "success", "added_signals": added_count}

