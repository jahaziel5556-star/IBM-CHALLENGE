from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np

from app.core.config import settings
from app.services.ibm_service import GraniteService


@dataclass
class FrameObservation:
    timestamp_seconds: float
    motion_score: float
    scene_change: float
    pitch_ratio: float
    line_ratio: float
    scoreboard_ratio: float
    closeup_score: float

    def to_prompt_dict(self) -> dict:
        return {
            "timestamp_seconds": round(self.timestamp_seconds, 2),
            "motion_score": round(self.motion_score, 4),
            "scene_change": round(self.scene_change, 4),
            "pitch_ratio": round(self.pitch_ratio, 4),
            "line_ratio": round(self.line_ratio, 4),
            "scoreboard_ratio": round(self.scoreboard_ratio, 4),
            "closeup_score": round(self.closeup_score, 4),
        }


class VideoAnalyzer:
    def __init__(self, *, granite_service: GraniteService | None = None) -> None:
        self.granite_service = granite_service or GraniteService()

    def analyze(self, *, video_path: Path, video_id: str, duration_seconds: float | None = None) -> dict:
        observations, metadata = self._sample_video(video_path=video_path, requested_duration=duration_seconds)
        if not observations:
            raise ValueError("No readable frames were found in the uploaded MP4.")

        deterministic_events = self._events_from_observations(
            observations=observations,
            metadata=metadata,
            video_id=video_id,
        )
        granite_events = self._events_from_granite(
            observations=observations,
            metadata=metadata,
            video_id=video_id,
        )
        events = granite_events or deterministic_events

        return {
            "events": events,
            "observations": [observation.to_prompt_dict() for observation in observations],
            "metadata": metadata,
            "analysis_mode": "granite_cv" if granite_events else "local_cv",
        }

    def _sample_video(self, *, video_path: Path, requested_duration: float | None) -> tuple[list[FrameObservation], dict]:
        capture = cv2.VideoCapture(str(video_path))
        if not capture.isOpened():
            raise ValueError("Unable to open uploaded MP4 for frame analysis.")

        fps = float(capture.get(cv2.CAP_PROP_FPS) or 0)
        frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
        height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
        native_duration = frame_count / fps if fps > 0 and frame_count > 0 else 0
        duration = requested_duration or native_duration
        if native_duration > 0 and requested_duration:
            duration = min(float(requested_duration), native_duration)
        if duration <= 0:
            duration = float(settings.video_analysis_sample_seconds * settings.video_analysis_min_events)

        sample_interval = max(float(settings.video_analysis_sample_seconds), 1.0)
        sample_count = min(max(int(duration / sample_interval), settings.video_analysis_min_events), settings.video_analysis_max_samples)
        timestamps = np.linspace(min(sample_interval, duration * 0.2), max(duration - 0.25, sample_interval), num=sample_count)

        previous_gray: np.ndarray | None = None
        observations: list[FrameObservation] = []
        for timestamp in timestamps:
            capture.set(cv2.CAP_PROP_POS_MSEC, float(timestamp) * 1000)
            ok, frame = capture.read()
            if not ok or frame is None:
                continue

            observation = self._observe_frame(frame=frame, previous_gray=previous_gray, timestamp=float(timestamp))
            previous_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            observations.append(observation)

        capture.release()
        metadata = {
            "fps": round(fps, 3),
            "frame_count": frame_count,
            "width": width,
            "height": height,
            "duration_seconds": round(float(duration), 2),
            "sample_count": len(observations),
        }
        return observations, metadata

    def _observe_frame(
        self,
        *,
        frame: np.ndarray,
        previous_gray: np.ndarray | None,
        timestamp: float,
    ) -> FrameObservation:
        height, width = frame.shape[:2]
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        green_mask = cv2.inRange(hsv, np.array([35, 30, 25]), np.array([95, 255, 255]))
        pitch_ratio = float(np.count_nonzero(green_mask) / green_mask.size)

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 60, 140)
        bright_mask = cv2.inRange(gray, 190, 255)
        line_ratio = float(np.count_nonzero(cv2.bitwise_and(edges, bright_mask)) / edges.size)

        top_band = frame[: max(1, int(height * 0.16)), :]
        scoreboard_ratio = float(np.mean(cv2.cvtColor(top_band, cv2.COLOR_BGR2GRAY) > 165))

        closeup_score = max(0.0, min(1.0, 1.0 - pitch_ratio + (scoreboard_ratio * 0.2)))

        if previous_gray is None or previous_gray.shape != gray.shape:
            motion_score = 0.0
            scene_change = 0.0
        else:
            diff = cv2.absdiff(gray, previous_gray)
            motion_score = float(np.mean(diff) / 255)
            hist_current = cv2.calcHist([gray], [0], None, [32], [0, 256])
            hist_previous = cv2.calcHist([previous_gray], [0], None, [32], [0, 256])
            scene_change = float(1 - cv2.compareHist(hist_current, hist_previous, cv2.HISTCMP_CORREL))
            scene_change = max(0.0, min(scene_change, 1.0))

        return FrameObservation(
            timestamp_seconds=timestamp,
            motion_score=motion_score,
            scene_change=scene_change,
            pitch_ratio=pitch_ratio,
            line_ratio=line_ratio,
            scoreboard_ratio=scoreboard_ratio,
            closeup_score=closeup_score,
        )

    def _events_from_observations(self, *, observations: list[FrameObservation], metadata: dict, video_id: str) -> list[dict]:
        ranked = sorted(
            observations,
            key=lambda item: (
                item.motion_score * 0.48
                + item.scene_change * 0.22
                + item.pitch_ratio * 0.18
                + item.line_ratio * 0.08
                + item.scoreboard_ratio * 0.04
            ),
            reverse=True,
        )
        selected: list[FrameObservation] = []
        spacing_seconds = max(2.0, min(8.0, float(metadata["duration_seconds"]) / 8))
        for observation in ranked:
            if all(abs(observation.timestamp_seconds - existing.timestamp_seconds) >= spacing_seconds for existing in selected):
                selected.append(observation)
            if len(selected) >= max(settings.video_analysis_min_events, 3):
                break

        if len(selected) < max(settings.video_analysis_min_events, 3):
            for observation in ranked:
                if observation not in selected:
                    selected.append(observation)
                if len(selected) >= max(settings.video_analysis_min_events, 3):
                    break

        selected = sorted(selected, key=lambda item: item.timestamp_seconds)
        return [
            self._event_from_observation(observation=observation, index=index, video_id=video_id, metadata=metadata)
            for index, observation in enumerate(selected, start=1)
        ]

    def _event_from_observation(
        self,
        *,
        observation: FrameObservation,
        index: int,
        video_id: str,
        metadata: dict,
    ) -> dict:
        event_type = self._classify_observation(observation)
        minute = max(1, round(observation.timestamp_seconds / 60))
        context = self._context_for_event(event_type)
        confidence = self._confidence(observation)
        summary = (
            f"Frame analysis found {context['visual_summary']} at {observation.timestamp_seconds:.1f}s "
            f"with motion {observation.motion_score:.2f}, pitch visibility {observation.pitch_ratio:.2f}, "
            f"and scene change {observation.scene_change:.2f}."
        )
        return {
            "timestamp_seconds": round(observation.timestamp_seconds, 2),
            "minute": minute,
            "type": event_type,
            "title": context["title"],
            "team": "Observed Team",
            "opponent": "Opposition",
            "summary": summary,
            "analysis": (
                f"The analyzer sampled {metadata['sample_count']} frames and identified this as a likely "
                f"{event_type.replace('_', ' ')} cue from visual motion, field coverage, line density, and scene-change metrics."
            ),
            "child_summary": context["child_summary"],
            "confidence": confidence,
            "law_reference": context.get("law_reference"),
            "cv_evidence": observation.to_prompt_dict(),
            "analysis_source": "local_cv",
            "id": f"{video_id}-cv-{index:03d}",
        }

    def _events_from_granite(
        self,
        *,
        observations: list[FrameObservation],
        metadata: dict,
        video_id: str,
    ) -> list[dict]:
        if not settings.video_analysis_use_granite or self.granite_service.is_mock:
            return []

        prompt_payload = {
            "system": (
                "You are MatchMind One's football video event analyst. "
                "Use only the supplied computer-vision observations. Do not claim certainty, official decisions, "
                "player identities, scores, or laws unless directly supported. Return JSON with an events array."
            ),
            "user": json.dumps(
                {
                    "task": "Choose 3 to 6 football event candidates from sampled MP4 visual observations.",
                    "allowed_event_types": [
                        "high_press_detected",
                        "dangerous_attack",
                        "counterattack",
                        "momentum_shift",
                        "tactical_formation_change",
                        "defensive_block_change",
                        "var_review",
                        "injury",
                    ],
                    "video_metadata": metadata,
                    "observations": [observation.to_prompt_dict() for observation in observations],
                    "required_event_fields": [
                        "timestamp_seconds",
                        "minute",
                        "type",
                        "title",
                        "summary",
                        "analysis",
                        "child_summary",
                        "confidence",
                    ],
                },
                indent=2,
            ),
        }
        raw = self.granite_service.generate_video_events(prompt_payload=prompt_payload)
        raw_events = raw.get("events", []) if isinstance(raw, dict) else []
        if not isinstance(raw_events, list):
            return []

        normalized_events = []
        for index, event in enumerate(raw_events[:6], start=1):
            if not isinstance(event, dict):
                continue
            timestamp = float(event.get("timestamp_seconds", index * 12))
            normalized_events.append(
                {
                    "id": f"{video_id}-granite-{index:03d}",
                    "timestamp_seconds": round(max(0.0, timestamp), 2),
                    "minute": self._coerce_minute(event.get("minute"), timestamp),
                    "type": str(event.get("type") or "dangerous_attack"),
                    "title": str(event.get("title") or "Granite Video Event"),
                    "team": str(event.get("team") or "Observed Team"),
                    "opponent": str(event.get("opponent") or "Opposition"),
                    "summary": str(event.get("summary") or "Granite selected this moment from visual frame observations."),
                    "analysis": str(event.get("analysis") or "Granite reasoned over sampled frame metrics from the MP4."),
                    "child_summary": str(event.get("child_summary") or "The video showed an important football moment."),
                    "confidence": str(event.get("confidence") or "medium"),
                    "law_reference": event.get("law_reference"),
                    "analysis_source": "granite_cv",
                }
            )
        return normalized_events

    def _coerce_minute(self, raw_minute: object, timestamp_seconds: float) -> int:
        if isinstance(raw_minute, int | float):
            return max(1, int(raw_minute))
        if isinstance(raw_minute, str):
            digits = "".join(character for character in raw_minute if character.isdigit())
            if digits:
                return max(1, int(digits[:2]))
        return max(1, round(timestamp_seconds / 60))

    def _classify_observation(self, observation: FrameObservation) -> str:
        if observation.scene_change > 0.55 and observation.closeup_score > 0.64:
            return "var_review"
        if observation.motion_score > 0.16 and observation.pitch_ratio > 0.26:
            return "counterattack"
        if observation.motion_score > 0.11 and observation.line_ratio > 0.012:
            return "dangerous_attack"
        if observation.pitch_ratio > 0.34 and observation.motion_score > 0.06:
            return "high_press_detected"
        if observation.closeup_score > 0.7 and observation.motion_score < 0.05:
            return "injury"
        return "momentum_shift"

    def _confidence(self, observation: FrameObservation) -> str:
        signal = observation.motion_score + observation.scene_change + observation.pitch_ratio + observation.line_ratio
        if signal > 0.78:
            return "high"
        if signal > 0.38:
            return "medium"
        return "low"

    def _context_for_event(self, event_type: str) -> dict:
        contexts = {
            "counterattack": {
                "title": "Counterattack Candidate",
                "visual_summary": "a rapid transition pattern",
                "child_summary": "The team moved quickly into open space.",
            },
            "dangerous_attack": {
                "title": "Dangerous Attack Candidate",
                "visual_summary": "a high-activity attacking phase",
                "child_summary": "The attack looked more dangerous than normal.",
            },
            "high_press_detected": {
                "title": "High Press Candidate",
                "visual_summary": "sustained field pressure",
                "child_summary": "Players were pressing together to win the ball.",
            },
            "var_review": {
                "title": "Review Or Replay Candidate",
                "visual_summary": "a likely replay or review-style scene change",
                "child_summary": "The broadcast looked like it was checking a moment again.",
            },
            "injury": {
                "title": "Stoppage Candidate",
                "visual_summary": "a low-motion close-up or stoppage pattern",
                "child_summary": "The game slowed down for a moment.",
            },
            "momentum_shift": {
                "title": "Momentum Shift Candidate",
                "visual_summary": "a visible change in game rhythm",
                "child_summary": "The game started to feel different.",
            },
        }
        return contexts.get(event_type, contexts["momentum_shift"])
