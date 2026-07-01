import { useEffect, useRef } from "react";

import type { MatchEvent, MatchSummary } from "../types/domain";

type MatchStageProps = {
  match?: MatchSummary;
  activeEvent?: MatchEvent;
  liveMinute: number;
  liveScore: {
    home: number;
    away: number;
  };
  videoUrl?: string;
  videoTitle?: string;
  timelineSource?: string;
  videoCurrentTime: number;
  videoDuration: number;
  isVideoPlaying: boolean;
  onTogglePlayback: () => void;
  onVideoSeek: (seconds: number) => void;
  onVideoTimeUpdate?: (currentTime: number) => void;
  onVideoLoadedMetadata?: (duration: number) => void;
  onVideoPlayStateChange?: (isPlaying: boolean) => void;
};

function formatClock(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function MatchStage({
  match,
  activeEvent,
  liveMinute,
  liveScore,
  videoUrl,
  videoTitle,
  timelineSource,
  videoCurrentTime,
  videoDuration,
  isVideoPlaying,
  onTogglePlayback,
  onVideoSeek,
  onVideoTimeUpdate,
  onVideoLoadedMetadata,
  onVideoPlayStateChange,
}: MatchStageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const element = videoRef.current;
    if (!element || !videoUrl) {
      return;
    }

    if (Math.abs(element.currentTime - videoCurrentTime) > 0.35) {
      element.currentTime = videoCurrentTime;
    }
  }, [videoCurrentTime, videoUrl]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element || !videoUrl) {
      return;
    }

    if (isVideoPlaying) {
      void element.play().catch(() => {
        onVideoPlayStateChange?.(false);
      });
      return;
    }

    element.pause();
  }, [isVideoPlaying, onVideoPlayStateChange, videoUrl]);

  return (
    <div className={videoUrl ? "match-stage match-stage-video" : "match-stage"}>
      <div className="score-bug">
        <div>
          <span>{match?.home_team ?? "Blue City"}</span>
          <strong>{liveScore.home}</strong>
        </div>
        <div>
          <span>{match?.away_team ?? "Crimson United"}</span>
          <strong>{liveScore.away}</strong>
        </div>
      </div>

      <div className="production-badge">{videoUrl ? "Broadcast review" : "Match simulation"}</div>

      {videoUrl ? (
        <div className="video-stage">
          <video
            ref={videoRef}
            className="match-video"
            src={videoUrl}
            playsInline
            onLoadedMetadata={(event) => onVideoLoadedMetadata?.(event.currentTarget.duration)}
            onTimeUpdate={(event) => onVideoTimeUpdate?.(event.currentTarget.currentTime)}
            onPlay={() => onVideoPlayStateChange?.(true)}
            onPause={() => onVideoPlayStateChange?.(false)}
          >
            <track kind="captions" />
          </video>
          <div className="video-vignette" />
          {activeEvent ? (
            <div className="event-pulse event-pulse-video">
              <span>{activeEvent.title}</span>
              <strong>{activeEvent.team}</strong>
            </div>
          ) : null}
          <div className="transport-bar">
            <button className="transport-toggle" onClick={onTogglePlayback} aria-label={isVideoPlaying ? "Pause video" : "Play video"}>
              {isVideoPlaying ? "Pause" : "Play"}
            </button>
            <div className="transport-slider-wrap">
              <span>{formatClock(videoCurrentTime)}</span>
              <input
                aria-label="Video timeline"
                className="transport-slider"
                type="range"
                min={0}
                max={videoDuration || 0}
                step={0.1}
                value={Math.min(videoCurrentTime, videoDuration || 0)}
                onChange={(event) => onVideoSeek(Number(event.currentTarget.value))}
              />
              <span>{formatClock(videoDuration)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="pitch">
          <div className="center-circle" />
          <div className="mid-line" />
          <div className="penalty-box penalty-box-left" />
          <div className="penalty-box penalty-box-right" />
          <div className="spot spot-left" />
          <div className="spot spot-right" />
          {activeEvent ? (
            <div className="event-pulse">
              <span>{activeEvent.title}</span>
              <strong>{activeEvent.team}</strong>
            </div>
          ) : null}
        </div>
      )}

      <div className="queue-banner">
        <span>{videoUrl ? "Match window" : "Match state"}</span>
        <p>{videoUrl ? `${timelineSource?.replace(/_/g, " ") ?? "manual"} | ${videoTitle ?? "Uploaded clip"}` : "Upload a clip to review a real moment."}</p>
      </div>

      <div className="commentary-strip">
        <span>Live</span>
        <p>{match?.competition ?? "World Championship Final"} | Minute {liveMinute}</p>
      </div>
    </div>
  );
}
