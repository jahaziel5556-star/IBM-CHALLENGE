from sqlalchemy.orm import Session

from app.repositories.profile_repository import ProfileRepository
from app.schemas.profile import ProfileRequest, SettingsResponse


class ProfileService:
    def __init__(self, session: Session) -> None:
        self.repository = ProfileRepository(session)

    def update_profile(self, request: ProfileRequest) -> dict:
        profile = self.repository.update_active_profile(
            profile_name=request.profile,
            language=request.language,
            large_text=request.large_text,
            high_contrast=request.high_contrast,
            reduced_motion=request.reduced_motion,
        )
        return {
            "status": "updated",
            "profile": profile.profile,
            "language": profile.language,
        }

    def get_profile(self) -> ProfileRequest:
        profile = self.repository.get_active_profile()
        return ProfileRequest(
            profile=profile.profile,
            language=profile.language,
            large_text=profile.large_text,
            high_contrast=profile.high_contrast,
            reduced_motion=profile.reduced_motion,
        )

    def get_settings(self) -> SettingsResponse:
        profile = self.repository.get_active_profile()
        return SettingsResponse(
            placement="lower-right",
            durations={
                "goal": 6,
                "var_review": 8,
                "offside": 7,
                "penalty": 7,
                "red_card": 8,
                "yellow_card": 6,
                "tactical_formation_change": 7,
                "momentum_shift": 6,
                "high_press_detected": 6,
                "defensive_block_change": 6,
                "counterattack": 5,
                "dangerous_attack": 5,
                "injury": 5,
                "substitution": 6,
            },
            profiles=["new_fan", "casual_viewer", "analyst", "child", "accessibility"],
            accessibility={
                "large_text": profile.large_text,
                "high_contrast": profile.high_contrast,
                "reduced_motion": profile.reduced_motion,
            },
        )
