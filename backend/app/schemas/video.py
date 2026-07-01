from pydantic import BaseModel


class VideoAsset(BaseModel):
    id: str
    filename: str
    video_url: str
    event_count: int
    analysis_status: str
    analysis_phase: str = "uploaded"
    analysis_progress: int = 0
    analysis_error: str | None = None
    timeline_source: str
    analysis_observation_count: int = 0
    created_at: str
    analysis_started_at: str | None = None
    analysis_completed_at: str | None = None


class VideoAnalysisRequest(BaseModel):
    duration_seconds: float | None = None


class VideoAnalysisResponse(BaseModel):
    video: VideoAsset
    events: list[dict]


class VideoAnalysisStatus(BaseModel):
    video: VideoAsset
    events: list[dict]
    is_complete: bool
