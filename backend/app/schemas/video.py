from pydantic import BaseModel


class VideoAsset(BaseModel):
    id: str
    filename: str
    video_url: str
    event_count: int
    analysis_status: str
    timeline_source: str
    created_at: str


class VideoAnalysisRequest(BaseModel):
    duration_seconds: float | None = None


class VideoAnalysisResponse(BaseModel):
    video: VideoAsset
    events: list[dict]
