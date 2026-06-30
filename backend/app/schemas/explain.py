from pydantic import BaseModel


class ExplainRequest(BaseModel):
    profile: str
    event_id: str


class OverlayPayload(BaseModel):
    placement: str
    duration_seconds: int


class ExplainResponse(BaseModel):
    event_id: str
    headline: str
    explanation: str
    confidence: str
    law_reference: str | None
    overlay: OverlayPayload
    prompt_template: str
    silent_recommended: bool
