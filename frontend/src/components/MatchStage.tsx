import type { MatchSummary } from "../types/domain";

type MatchStageProps = {
  match?: MatchSummary;
};

export function MatchStage({ match }: MatchStageProps) {
  return (
    <div className="match-stage">
      <div className="score-bug">
        <div>
          <span>{match?.home_team ?? "Blue City"}</span>
          <strong>{match?.score.home ?? 1}</strong>
        </div>
        <div>
          <span>{match?.away_team ?? "Crimson United"}</span>
          <strong>{match?.score.away ?? 1}</strong>
        </div>
      </div>

      <div className="pitch">
        <div className="center-circle" />
        <div className="mid-line" />
        <div className="penalty-box penalty-box-left" />
        <div className="penalty-box penalty-box-right" />
        <div className="spot spot-left" />
        <div className="spot spot-right" />
      </div>

      <div className="commentary-strip">
        <span>Live</span>
        <p>World Championship Final • Atlas Stadium • Minute 78</p>
      </div>
    </div>
  );
}
