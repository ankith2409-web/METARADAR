from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class ScoutOutput(BaseModel):
    is_relevant: bool
    reason: str


class AnalystOutput(BaseModel):
    relevance_score: int = Field(ge=1, le=10)
    threat_level: str  # low, medium, high
    competitors: List[str]
    therapeutic_area: str
    rationale: str
    event_type: str = "routine_status_update"
    breakthrough_designation: bool = False


class StrategistOutput(BaseModel):
    recommended_action: str
    justification: str


class ExposureRoutingResponse(BaseModel):
    id: Optional[int] = None
    signal_id: Optional[int] = None
    franchise_overlap: str
    exposure_bucket: str
    exposure_range_illustrative: Optional[str] = None
    exposure_source_citation: Optional[str] = None
    exposure_methodology_note: str
    routing_owner: str
    routing_deadline_note: str
    computed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AgentTraceResponse(BaseModel):
    id: int
    signal_id: int
    scout_output: ScoutOutput
    analyst_output: AnalystOutput
    strategist_output: StrategistOutput
    exposure_routing: Optional[ExposureRoutingResponse] = None
    is_fallback: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SignalResponse(BaseModel):
    id: int
    external_id: Optional[str] = None
    title: str
    summary: str
    source: str
    url: Optional[str] = None
    doi: Optional[str] = None
    published_date: str
    competitor: str
    therapeutic_area: str
    threat_level: str
    relevance_score: int
    rationale: Optional[str] = None
    recommended_action: Optional[str] = None
    action_justification: Optional[str] = None
    ingested_at: datetime
    is_replay: bool
    trace: Optional[AgentTraceResponse] = None
    exposure_routing: Optional[ExposureRoutingResponse] = None

    model_config = ConfigDict(from_attributes=True)


class SignalListResponse(BaseModel):
    total: int

    signals: List[SignalResponse]


class NarrativeThreadResponse(BaseModel):
    id: int
    competitor: str
    title: str
    narrative_summary: str
    signal_ids: List[int]
    signal_count: int
    time_window_days: int
    signals: List[SignalResponse] = []

    model_config = ConfigDict(from_attributes=True)


class InflectionEventResponse(BaseModel):
    id: int
    competitor: str
    week_label: str
    mention_count: int
    rolling_mean: float
    z_score: float
    growth_pct: float
    is_flagged: bool

    model_config = ConfigDict(from_attributes=True)


class BattleCardResponse(BaseModel):
    id: int
    competitor: str
    canonical_name: str
    lead_asset: str
    mechanism: str
    pipeline_stage: str
    threat_assessment: str
    recent_moves: List[str]
    key_threats: List[str]
    market_position: str
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SourceCitation(BaseModel):
    label: str
    url: str


class ValidationReportResponse(BaseModel):
    title: str
    event_name: str
    event_date: str
    flagged_date: str
    lead_time_days: int
    competitor: str
    summary: str
    historical_signals: List[SignalResponse] = []
    source_citations: List[SourceCitation] = []


