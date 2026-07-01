from pydantic import BaseModel


class ExplainRequest(BaseModel):
    profile: str
    event_id: str


class OverlayPayload(BaseModel):
    placement: str
    duration_seconds: int


class EventEngineDecision(BaseModel):
    should_speak: bool
    priority: int
    priority_label: str
    confidence: str
    reason: str
    timing: str


class ExplainResponse(BaseModel):
    event_id: str
    headline: str
    explanation: str
    confidence: str
    law_reference: str | None
    overlay: OverlayPayload
    prompt_template: str
    silent_recommended: bool
    why_now: str
    silence_rule: str
    retrieval_sources: list[str]
    evidence: list[str]
    decision: EventEngineDecision
