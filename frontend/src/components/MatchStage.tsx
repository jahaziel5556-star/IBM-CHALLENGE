import { useEffect, useRef, type CSSProperties } from "react";

import type { ExplainResponse, MatchEvent, MatchSummary } from "../types/domain";

type MatchStageProps = {
  match?: MatchSummary;
  liveScore: {
    home: number;
    away: number;
  };
  videoUrl?: string;
  videoCurrentTime: number;
  videoDuration: number;
  isVideoPlaying: boolean;
  transientInsight: ExplainResponse | null;
  transientPendingEvent?: MatchEvent | null;
  onTogglePlayback: () => void;
  onVideoSeek: (seconds: number) => void;
  onSkipBy: (seconds: number) => void;
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
  liveScore,
  videoUrl,
  videoCurrentTime,
  videoDuration,
  isVideoPlaying,
  transientInsight,
  transientPendingEvent,
  onTogglePlayback,
  onVideoSeek,
  onSkipBy,
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

    if (Math.abs(element.currentTime - videoCurrentTime) > 0.2) {
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
    <section className="watch-shell">
      <div className="watch-player-frame">
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

        {videoUrl ? (
          <div className="video-stage">
            <video
              ref={videoRef}
              className="match-video"
              src={videoUrl}
              playsInline
              onClick={onTogglePlayback}
              onLoadedMetadata={(event) => onVideoLoadedMetadata?.(event.currentTarget.duration)}
              onTimeUpdate={(event) => onVideoTimeUpdate?.(event.currentTarget.currentTime)}
              onPlay={() => onVideoPlayStateChange?.(true)}
              onPause={() => onVideoPlayStateChange?.(false)}
            >
              <track kind="captions" />
            </video>
            <div className="video-vignette" />

            {!isVideoPlaying ? (
              <button className="video-center-toggle" onClick={onTogglePlayback} aria-label="Play video">
                Play
              </button>
            ) : null}

            <div className="player-chrome-top">
              <div className="player-badge">MatchMind live analysis</div>
              <div className="player-shortcuts">Space/K play | J/L 10s | Left/Right 30s</div>
            </div>

            {transientInsight || transientPendingEvent ? (
              <aside
                key={transientInsight?.event_id ?? transientPendingEvent?.id ?? "overlay"}
                className={transientInsight ? "video-insight-card" : "video-insight-card video-insight-card-pending"}
                aria-live="polite"
                style={
                  transientInsight
                    ? ({ "--overlay-duration": `${transientInsight.overlay.duration_seconds}s` } as CSSProperties)
                    : undefined
                }
              >
                <div className="video-insight-topline">
                  <span>{transientInsight ? "AI overlay" : "Reading the moment"}</span>
                  <strong>{transientInsight?.confidence ?? "live"}</strong>
                </div>
                <h3>{transientInsight?.headline ?? transientPendingEvent?.title ?? "Analyzing moment"}</h3>
                <p>{transientInsight?.explanation ?? "AI is preparing the explanation for this incident."}</p>
                <div className="video-insight-meta">
                  {transientInsight?.law_reference ? <span>{transientInsight.law_reference}</span> : null}
                  {!transientInsight && transientPendingEvent?.type ? <span>{transientPendingEvent.type.replace(/_/g, " ")}</span> : null}
                </div>
                <div className="video-insight-progress" />
              </aside>
            ) : null}

            <div className="transport-bar" aria-label="Video playback controls">
              <button className="transport-toggle" onClick={onTogglePlayback} aria-label={isVideoPlaying ? "Pause video" : "Play video"}>
                {isVideoPlaying ? "Pause" : "Play"}
              </button>
              <button className="transport-jump" onClick={() => onSkipBy(-30)} aria-label="Back 30 seconds">
                -30
              </button>
              <div className="transport-slider-wrap">
                <span className="transport-time">{formatClock(videoCurrentTime)}</span>
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
                <span className="transport-time">{formatClock(videoDuration)}</span>
              </div>
              <button className="transport-jump" onClick={() => onSkipBy(30)} aria-label="Forward 30 seconds">
                +30
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-player">
            <p className="section-label">Broadcast Preview</p>
            <h2>Load a match clip</h2>
            <p>The video player becomes the full experience. AI explanations only surface when the moment actually needs them.</p>
          </div>
        )}
      </div>
    </section>
  );
}
