from pydantic import BaseModel


class ProfileRequest(BaseModel):
    profile: str
    language: str = "en"
    large_text: bool = False
    high_contrast: bool = False
    reduced_motion: bool = False


class SettingsResponse(BaseModel):
    placement: str
    durations: dict[str, int]
    profiles: list[str]
    accessibility: dict[str, bool]
