from fastapi import APIRouter, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database.session import SessionLocal
from app.schemas.demo import DemoScriptStep
from app.schemas.profile import ProfileRequest, ProfileResponse, SettingsResponse
from app.schemas.explain import ExplainRequest, ExplainResponse
from app.schemas.system import SystemSummary
from app.schemas.video import VideoAnalysisRequest, VideoAnalysisResponse, VideoAsset
from app.services.explanation_service import ExplanationService
from app.services.match_service import MatchService
from app.services.profile_service import ProfileService
from app.services.video_service import VideoService

router = APIRouter()


def _build_services() -> tuple[Session, MatchService, ProfileService, ExplanationService]:
    session = SessionLocal()
    match_service = MatchService(session)
    profile_service = ProfileService(session)
    explanation_service = ExplanationService(match_service, profile_service)
    return session, match_service, profile_service, explanation_service


@router.get("/health")
def health() -> dict[str, str | bool]:
    session, match_service, profile_service, explanation_service = _build_services()
    session.close()
    return {
        "status": "ok",
        "service": "matchmind-one-api",
        "ibm_mode": "mock" if explanation_service.ibm_service.is_mock else "watsonx",
        "database_backend": match_service.repository.session.bind.dialect.name,
    }


@router.get("/api/matches")
def list_matches() -> list[dict]:
    session, match_service, _, _ = _build_services()
    try:
        return match_service.list_matches()
    finally:
        session.close()


@router.get("/api/matches/{match_id}")
def get_match(match_id: str) -> dict:
    session, match_service, _, _ = _build_services()
    try:
        match = match_service.get_match(match_id)
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")
        return match
    finally:
        session.close()


@router.get("/api/matches/{match_id}/events")
def list_match_events(match_id: str) -> list[dict]:
    session, match_service, _, _ = _build_services()
    try:
        match = match_service.get_match(match_id)
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")
        return match_service.list_events_for_match(match_id)
    finally:
        session.close()


@router.get("/api/events/{event_id}")
def get_event(event_id: str) -> dict:
    session, match_service, _, _ = _build_services()
    try:
        event = match_service.get_event(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        return event
    finally:
        session.close()


@router.get("/api/demo-script", response_model=list[DemoScriptStep])
def get_demo_script() -> list[DemoScriptStep]:
    session, match_service, _, _ = _build_services()
    try:
        return match_service.get_demo_script()
    finally:
        session.close()


@router.get("/api/system/summary", response_model=SystemSummary)
def get_system_summary() -> SystemSummary:
    session, match_service, _, explanation_service = _build_services()
    try:
        return SystemSummary(
            **match_service.get_system_summary(
                ibm_mode="mock" if explanation_service.ibm_service.is_mock else "watsonx"
            )
        )
    finally:
        session.close()


@router.get("/api/videos", response_model=list[VideoAsset])
def list_videos() -> list[dict]:
    return VideoService().list_videos()


@router.post("/api/videos/upload", response_model=VideoAsset)
async def upload_video(
    video: UploadFile = File(...),
    events: UploadFile | None = File(default=None),
) -> dict:
    try:
        event_payload = await events.read() if events else None
        return VideoService().create_video(video=video, event_payload=event_payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/api/videos/{video_id}", response_model=VideoAsset)
def get_video(video_id: str) -> dict:
    video = VideoService().get_video(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video


@router.post("/api/videos/{video_id}/analyze", response_model=VideoAnalysisResponse)
def analyze_video(video_id: str, request: VideoAnalysisRequest) -> dict:
    try:
        return VideoService().analyze_video(video_id, duration_seconds=request.duration_seconds)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/api/videos/{video_id}/events")
def list_video_events(video_id: str) -> list[dict]:
    if not VideoService().get_video(video_id):
        raise HTTPException(status_code=404, detail="Video not found")
    return VideoService().list_events(video_id)


@router.post("/api/explain", response_model=ExplainResponse)
def explain_event(request: ExplainRequest) -> ExplainResponse:
    session, match_service, profile_service, explanation_service = _build_services()
    try:
        return explanation_service.explain_event(request)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    finally:
        session.close()


@router.post("/api/profile")
def update_profile(request: ProfileRequest) -> dict:
    session, _, profile_service, _ = _build_services()
    try:
        return profile_service.update_profile(request)
    finally:
        session.close()


@router.get("/api/profile", response_model=ProfileResponse)
def get_profile() -> ProfileResponse:
    session, _, profile_service, _ = _build_services()
    try:
        return profile_service.get_profile()
    finally:
        session.close()


@router.get("/api/settings", response_model=SettingsResponse)
def get_settings() -> SettingsResponse:
    session, _, profile_service, _ = _build_services()
    try:
        return profile_service.get_settings()
    finally:
        session.close()
