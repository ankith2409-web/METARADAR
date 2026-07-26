from datetime import datetime
from sqlalchemy import (
    create_engine, Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class SignalModel(Base):
    __tablename__ = "signals"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String(255), unique=True, index=True, nullable=True)
    title = Column(Text, nullable=False)
    summary = Column(Text, nullable=False)
    source = Column(String(50), nullable=False)
    url = Column(Text, nullable=True)
    doi = Column(String(255), nullable=True)
    published_date = Column(String(50), nullable=False)
    competitor = Column(String(100), index=True, nullable=False)
    therapeutic_area = Column(String(100), default="Metabolic Disease")
    threat_level = Column(String(20), default="medium")
    relevance_score = Column(Integer, default=5)
    rationale = Column(Text, nullable=True)
    recommended_action = Column(String(100), nullable=True)
    action_justification = Column(Text, nullable=True)
    ingested_at = Column(DateTime, default=datetime.utcnow)
    is_replay = Column(Boolean, default=False)

    trace = relationship(
        "AgentTraceModel", back_populates="signal", uselist=False, cascade="all, delete-orphan"
    )
    exposure_routing = relationship(
        "ExposureRoutingModel", back_populates="signal", uselist=False, cascade="all, delete-orphan"
    )


class AgentTraceModel(Base):
    __tablename__ = "agent_traces"

    id = Column(Integer, primary_key=True, index=True)
    signal_id = Column(Integer, ForeignKey("signals.id"), unique=True)
    scout_output = Column(Text, nullable=False)
    analyst_output = Column(Text, nullable=False)
    strategist_output = Column(Text, nullable=False)
    is_fallback = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    signal = relationship("SignalModel", back_populates="trace")


class ExposureRoutingModel(Base):
    __tablename__ = "exposure_routing"

    id = Column(Integer, primary_key=True, index=True)
    signal_id = Column(Integer, ForeignKey("signals.id"), unique=True)
    franchise_overlap = Column(String(50), nullable=False)
    exposure_bucket = Column(String(20), nullable=False)
    exposure_range_illustrative = Column(Text, nullable=True)
    exposure_source_citation = Column(Text, nullable=True)
    exposure_methodology_note = Column(Text, nullable=False)
    routing_owner = Column(String(100), index=True, nullable=False)
    routing_deadline_note = Column(Text, nullable=False)
    computed_at = Column(DateTime, default=datetime.utcnow)

    signal = relationship("SignalModel", back_populates="exposure_routing")



class NarrativeThreadModel(Base):
    __tablename__ = "narrative_threads"

    id = Column(Integer, primary_key=True, index=True)
    competitor = Column(String(100), index=True)
    title = Column(String(255), nullable=False)
    narrative_summary = Column(Text, nullable=False)
    signal_ids_json = Column(Text, nullable=False)
    signal_count = Column(Integer, default=0)
    time_window_days = Column(Integer, default=30)
    created_at = Column(DateTime, default=datetime.utcnow)


class InflectionEventModel(Base):
    __tablename__ = "inflection_events"

    id = Column(Integer, primary_key=True, index=True)
    competitor = Column(String(100), index=True)
    week_label = Column(String(50))
    mention_count = Column(Integer, default=0)
    rolling_mean = Column(Float, default=0.0)
    z_score = Column(Float, default=0.0)
    growth_pct = Column(Float, default=0.0)
    is_flagged = Column(Boolean, default=False)
    flagged_at = Column(DateTime, default=datetime.utcnow)


class BattleCardModel(Base):
    __tablename__ = "battle_cards"

    id = Column(Integer, primary_key=True, index=True)
    competitor = Column(String(100), unique=True, index=True)
    canonical_name = Column(String(150))
    lead_asset = Column(String(150))
    mechanism = Column(String(150))
    pipeline_stage = Column(String(100))
    threat_assessment = Column(String(50))
    recent_moves_json = Column(Text)
    key_threats_json = Column(Text)
    market_position = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow)


class ValidationLogModel(Base):
    __tablename__ = "validation_logs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    event_name = Column(Text, nullable=False)
    event_date = Column(String(50), nullable=False)
    flagged_date = Column(String(50), nullable=False)
    lead_time_days = Column(Integer, default=0)
    competitor = Column(String(100), index=True, nullable=False)
    summary = Column(Text, nullable=False)
    methodology = Column(Text, nullable=True)
    historical_timeline_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)


# Run init_db on module import to ensure all metadata tables exist
init_db()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


