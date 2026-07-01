from __future__ import annotations

import json
import re
import shutil
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import settings
from app.services.video_analyzer import VideoAnalyzer


class VideoService:
    def __init__(self) -> None:
        self.upload_root = self._resolve_upload_root()
        self.rules = self._load_rules()

    def list_videos(self) -> list[dict]:
        self.upload_root.mkdir(parents=True, exist_ok=True)
        videos = [self._load_metadata(path) for path in self.upload_root.glob("*/metadata.json")]
        return sorted((video for video in videos if video), key=lambda item: item["created_at"], reverse=True)

    def get_video(self, video_id: str) -> dict | None:
        return self._load_metadata(self._video_dir(video_id) / "metadata.json")

    def create_video(self, *, video: UploadFile, event_payload: bytes | None = None) -> dict:
        filename = Path(video.filename or "match-clip.mp4").name
        if Path(filename).suffix.lower() != ".mp4":
            raise ValueError("Only .mp4 video uploads are supported.")

        video_id = f"{self._slugify(Path(filename).stem)}-{uuid4().hex[:8]}"
        video_dir = self._video_dir(video_id)
        video_dir.mkdir(parents=True, exist_ok=False)

        video_path = video_dir / "video.mp4"
        with video_path.open("wb") as destination:
            shutil.copyfileobj(video.file, destination)

        events = self._parse_event_payload(event_payload, video_id=video_id) if event_payload else []
        if events:
            self._write_events(video_id, events)

        metadata = {
            "id": video_id,
            "filename": filename,
            "video_url": f"/uploads/{video_id}/video.mp4",
            "event_count": len(events),
            "analysis_status": "events_ready" if events else "uploaded",
            "timeline_source": "sidecar_json" if events else "none",
            "analysis_observation_count": 0,
            "created_at": datetime.now(UTC).isoformat(),
        }
        self._write_metadata(video_id, metadata)
        return metadata

    def analyze_video(self, video_id: str, *, duration_seconds: float | None = None) -> dict:
        metadata = self.get_video(video_id)
        if not metadata:
            raise ValueError("Video not found")

        existing_events = self.list_events(video_id)
        if existing_events:
            return {"video": metadata, "events": existing_events}

        video_path = self._video_dir(video_id) / "video.mp4"
        analysis = VideoAnalyzer().analyze(
            video_path=video_path,
            video_id=video_id,
            duration_seconds=duration_seconds,
        )
        analyzed_events = [
            self._normalize_event(item, index=index, video_id=video_id)
            for index, item in enumerate(analysis["events"], start=1)
        ]
        self._write_events(video_id, analyzed_events)
        self._write_analysis(video_id, analysis)
        metadata["event_count"] = len(analyzed_events)
        metadata["analysis_status"] = "cv_analysis_ready"
        metadata["timeline_source"] = analysis["analysis_mode"]
        metadata["analysis_observation_count"] = len(analysis["observations"])
        self._write_metadata(video_id, metadata)
        return {"video": metadata, "events": analyzed_events}

    def list_events(self, video_id: str) -> list[dict]:
        events_path = self._video_dir(video_id) / "events.json"
        if not events_path.exists():
            return []
        with events_path.open("r", encoding="utf-8") as file:
            return json.load(file)

    def find_event(self, event_id: str) -> dict | None:
        self.upload_root.mkdir(parents=True, exist_ok=True)
        for events_path in self.upload_root.glob("*/events.json"):
            with events_path.open("r", encoding="utf-8") as file:
                for event in json.load(file):
                    if event["id"] == event_id:
                        return event
        return None

    def _parse_event_payload(self, payload: bytes | None, *, video_id: str) -> list[dict]:
        if not payload:
            return []
        try:
            parsed = json.loads(payload.decode("utf-8"))
        except json.JSONDecodeError as exc:
            raise ValueError("Event timeline JSON is invalid.") from exc

        raw_events = parsed.get("events", parsed) if isinstance(parsed, dict) else parsed
        if not isinstance(raw_events, list):
            raise ValueError("Event timeline must be a JSON array or an object with an events array.")

        return [self._normalize_event(item, index=index, video_id=video_id) for index, item in enumerate(raw_events, start=1)]

    def _normalize_event(self, item: dict, *, index: int, video_id: str) -> dict:
        if not isinstance(item, dict):
            raise ValueError("Each timeline event must be an object.")

        event_type = self._normalize_event_type(str(item.get("type", item.get("event_type", "dangerous_attack"))))
        rule = self.rules.get(event_type, self.rules["dangerous_attack"])
        timestamp_seconds = self._coerce_timestamp(item, index)
        minute = self._coerce_minute(item.get("minute"), timestamp_seconds)
        title = str(item.get("title") or event_type.replace("_", " ").title())
        team = str(item.get("team") or "Attacking Team")
        opponent = str(item.get("opponent") or "Defending Team")
        summary = str(item.get("summary") or f"{title} appears in the uploaded clip.")
        analysis = str(item.get("analysis") or item.get("description") or summary)
        child_summary = str(item.get("child_summary") or self._simple_child_summary(event_type, team))

        return {
            "id": str(item.get("id") or f"{video_id}-evt-{index:03d}"),
            "match_id": str(item.get("match_id") or f"uploaded-video-{video_id}"),
            "video_id": video_id,
            "timestamp_seconds": timestamp_seconds,
            "minute": minute,
            "type": event_type,
            "title": title,
            "team": team,
            "opponent": opponent,
            "summary": summary,
            "analysis": analysis,
            "child_summary": child_summary,
            "confidence": str(item.get("confidence") or "medium"),
            "law_reference": item.get("law_reference") or self._default_law_reference(event_type),
            "silent_recommended": bool(item.get("silent_recommended", False)),
            "analysis_source": item.get("analysis_source", "sidecar_json" if "timestamp_seconds" in item else "seeded"),
            "cv_evidence": item.get("cv_evidence"),
            "rule": {
                "event_type": event_type,
                "prompt_template": rule["prompt_template"],
                "overlay_seconds": min(int(rule["overlay_seconds"]), 10),
                "priority": int(rule.get("priority", 50)),
                "retrieval_sources": rule.get("retrieval_sources", []),
                "trigger_summary": rule.get("trigger_summary", ""),
                "silence_summary": rule.get("silence_summary", ""),
            },
        }

    def _build_demo_timeline(self, *, video_id: str, duration_seconds: float | None) -> list[dict]:
        data_path = Path(__file__).resolve().parents[1] / "data" / "events.json"
        with data_path.open("r", encoding="utf-8") as file:
            seed_events = json.load(file)

        selected_ids = ["evt-highpress-12", "evt-offside-24", "evt-penalty-62", "evt-var-64", "evt-goal-81"]
        selected_events = [event for event in seed_events if event["id"] in selected_ids]
        duration = max(float(duration_seconds or 90), 30.0)
        marks = [0.12, 0.28, 0.52, 0.62, 0.82]

        demo_events = []
        for index, (event, mark) in enumerate(zip(selected_events, marks, strict=False), start=1):
            item = {**event, "id": f"{video_id}-demo-{index:03d}", "timestamp_seconds": round(duration * mark, 2)}
            demo_events.append(self._normalize_event(item, index=index, video_id=video_id))
        return demo_events

    def _load_rules(self) -> dict[str, dict]:
        rules_path = Path(__file__).resolve().parents[1] / "data" / "event_rules.json"
        with rules_path.open("r", encoding="utf-8") as file:
            rules = json.load(file)
        return {item["event_type"]: item for item in rules}

    def _load_metadata(self, metadata_path: Path) -> dict | None:
        if not metadata_path.exists():
            return None
        with metadata_path.open("r", encoding="utf-8") as file:
            return json.load(file)

    def _write_metadata(self, video_id: str, metadata: dict) -> None:
        metadata_path = self._video_dir(video_id) / "metadata.json"
        with metadata_path.open("w", encoding="utf-8") as file:
            json.dump(metadata, file, indent=2)

    def _write_events(self, video_id: str, events: list[dict]) -> None:
        events_path = self._video_dir(video_id) / "events.json"
        with events_path.open("w", encoding="utf-8") as file:
            json.dump(events, file, indent=2)

    def _write_analysis(self, video_id: str, analysis: dict) -> None:
        analysis_path = self._video_dir(video_id) / "analysis.json"
        with analysis_path.open("w", encoding="utf-8") as file:
            json.dump(analysis, file, indent=2)

    def _video_dir(self, video_id: str) -> Path:
        return self.upload_root / self._slugify(video_id)

    def _resolve_upload_root(self) -> Path:
        configured = Path(settings.upload_dir)
        if configured.is_absolute():
            return configured
        backend_root = Path(__file__).resolve().parents[2]
        return backend_root / configured

    def _slugify(self, value: str) -> str:
        slug = re.sub(r"[^a-zA-Z0-9_-]+", "-", value.strip().lower()).strip("-")
        return slug or "match-clip"

    def _normalize_event_type(self, event_type: str) -> str:
        normalized = event_type.strip().lower().replace(" ", "_").replace("-", "_")
        aliases = {
            "disallowed_goal": "goal_disallowed",
            "formation_change": "tactical_formation_change",
            "tactical_shift": "tactical_formation_change",
            "high_press": "high_press_detected",
            "injury_stoppage": "injury",
        }
        return aliases.get(normalized, normalized if normalized in self.rules else "dangerous_attack")

    def _coerce_timestamp(self, item: dict, index: int) -> float:
        raw_timestamp = item.get("timestamp_seconds", item.get("timestamp", item.get("time_seconds")))
        if raw_timestamp is None:
            return float(index * 12)
        return max(0.0, float(raw_timestamp))

    def _coerce_minute(self, raw_minute: object, timestamp_seconds: float) -> int:
        if isinstance(raw_minute, int | float):
            return max(1, int(raw_minute))
        if isinstance(raw_minute, str):
            stripped = raw_minute.strip()
            if stripped.isdigit():
                return max(1, int(stripped))
        return max(1, round(timestamp_seconds / 60))

    def _default_law_reference(self, event_type: str) -> str | None:
        if event_type in {"offside", "goal_disallowed"}:
            return "Law 11"
        if event_type in {"penalty", "no_penalty", "red_card", "yellow_card"}:
            return "Law 12"
        return None

    def _simple_child_summary(self, event_type: str, team: str) -> str:
        simple_names = {
            "goal": f"{team} scored because they made a strong attacking play.",
            "goal_disallowed": "The goal did not count because the rules stopped it.",
            "var_review": "The officials are checking the video to make the right call.",
            "offside": "The attacker ran too early before the pass.",
            "penalty": "The referee saw a foul near goal.",
            "no_penalty": "The referee decided the contact was not enough for a penalty.",
        }
        return simple_names.get(event_type, f"{team} did something important in this moment.")
