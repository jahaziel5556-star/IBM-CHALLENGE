from pydantic import BaseModel


class SystemSummary(BaseModel):
    database_backend: str
    ibm_mode: str
    match_count: int
    event_count: int
    rule_count: int
    demo_step_count: int
    profiles_supported: list[str]
    event_types_supported: list[str]
