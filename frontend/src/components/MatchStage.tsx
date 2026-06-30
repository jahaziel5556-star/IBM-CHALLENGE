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
};

export function MatchStage({ match, activeEvent, queueLength, isAutoRunning, liveMinute, liveScore }: MatchStageProps) {
  return (
    <div className="match-stage">
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

      <div className="queue-banner">
        <span>Overlay Queue</span>
        <p>{queueLength} event{queueLength === 1 ? "" : "s"} waiting for explanation timing</p>
      </div>

      <div className="commentary-strip">
        <span>Live</span>
        <p>World Championship Final | Atlas Stadium | Minute {liveMinute}</p>
      </div>
    </div>
  );
}
