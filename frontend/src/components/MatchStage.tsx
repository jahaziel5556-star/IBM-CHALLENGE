import type { MatchEvent, MatchSummary } from "../types/domain";

type MatchStageProps = {
  match?: MatchSummary;
  activeEvent?: MatchEvent;
  queueLength: number;
  isAutoRunning: boolean;
  liveMinute: number;
  liveScore: {
    home: number;
    away: number;
  };
  videoUrl?: string;
  videoTitle?: string;
  videoEventCount?: number;
  timelineSource?: string;
  onVideoTimeUpdate?: (currentTime: number) => void;
  onVideoLoadedMetadata?: (duration: number) => void;
};

export function MatchStage({
  match,
  activeEvent,
  queueLength,
  isAutoRunning,
  liveMinute,
  liveScore,
  videoUrl,
  videoTitle,
  videoEventCount,
  timelineSource,
  onVideoTimeUpdate,
  onVideoLoadedMetadata,
}: MatchStageProps) {
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

      <div className="production-badge">{isAutoRunning ? "Live sequencing" : "Manual review"}</div>

      {videoUrl ? (
        <div className="video-stage">
          <video
            className="match-video"
            src={videoUrl}
            controls
            playsInline
            onLoadedMetadata={(event) => onVideoLoadedMetadata?.(event.currentTarget.duration)}
            onTimeUpdate={(event) => onVideoTimeUpdate?.(event.currentTarget.currentTime)}
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
        <span>{videoUrl ? "Video Timeline" : "Overlay Queue"}</span>
        <p>
          {videoUrl
            ? `${videoEventCount ?? 0} timed events | ${timelineSource?.replace(/_/g, " ") ?? "timeline"}`
            : `${queueLength} event${queueLength === 1 ? "" : "s"} waiting for explanation timing`}
        </p>
      </div>

      <div className="commentary-strip">
        <span>Live</span>
        <p>{videoTitle ?? "World Championship Final | Atlas Stadium"} | Minute {liveMinute}</p>
      </div>
    </div>
  );
}
