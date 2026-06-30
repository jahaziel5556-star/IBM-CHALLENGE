from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.profile import Profile


class ProfileRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_active_profile(self) -> Profile:
        profile = self.session.scalar(select(Profile).order_by(Profile.id).limit(1))
        if not profile:
            profile = Profile(
                id=1,
                profile="new_fan",
                language="en",
                large_text=False,
                high_contrast=False,
                reduced_motion=False,
            )
            self.session.add(profile)
            self.session.commit()
            self.session.refresh(profile)
        return profile

    def update_active_profile(
        self,
        *,
        profile_name: str,
        language: str,
        large_text: bool,
        high_contrast: bool,
        reduced_motion: bool,
    ) -> Profile:
        profile = self.get_active_profile()
        profile.profile = profile_name
        profile.language = language
        profile.large_text = large_text
        profile.high_contrast = high_contrast
        profile.reduced_motion = reduced_motion
        self.session.commit()
        self.session.refresh(profile)
        return profile
