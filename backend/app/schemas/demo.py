from pydantic import BaseModel


class DemoScriptStep(BaseModel):
    step: int
    event_id: str
    label: str
    reason: str
