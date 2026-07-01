class EventEngine:
    def evaluate(self, *, event: dict, profile: str) -> dict:
        rule = event.get("rule") or {}
        priority = int(rule.get("priority", 50))
        confidence = event.get("confidence", "medium")
        priority_label = self._priority_label(priority)
        profile_threshold = self._profile_threshold(profile)
        has_grounding = bool(event.get("summary")) and confidence != "unknown"
        should_speak = not event.get("silent_recommended", False) and has_grounding and priority >= profile_threshold

        if priority_label == "critical":
            should_speak = not event.get("silent_recommended", False) and has_grounding

        return {
            "should_speak": should_speak,
            "priority": priority,
            "priority_label": priority_label,
            "confidence": confidence,
            "reason": self._reason(
                event=event,
                profile=profile,
                priority_label=priority_label,
                priority=priority,
                profile_threshold=profile_threshold,
                should_speak=should_speak,
            ),
            "timing": rule.get("trigger_summary", "Speak only after the moment is clear and broadcast-safe."),
        }

    def _priority_label(self, priority: int) -> str:
        if priority >= 95:
            return "critical"
        if priority >= 75:
            return "high"
        if priority >= 55:
            return "medium"
        return "low"

    def _profile_threshold(self, profile: str) -> int:
        if profile in {"new_fan", "child", "accessibility"}:
            return 55
        if profile == "casual_viewer":
            return 60
        if profile == "analyst":
            return 65
        return 60

    def _reason(
        self,
        *,
        event: dict,
        profile: str,
        priority_label: str,
        priority: int,
        profile_threshold: int,
        should_speak: bool,
    ) -> str:
        event_name = event["type"].replace("_", " ")
        if should_speak:
            return (
                f"{priority_label.title()} priority {event_name} matched the {profile} profile "
                f"threshold ({priority} >= {profile_threshold}) with {event.get('confidence', 'medium')} confidence."
            )
        return (
            f"The engine would stay quiet because {event_name} did not clear the {profile} "
            f"profile threshold or lacked enough trusted context."
        )
