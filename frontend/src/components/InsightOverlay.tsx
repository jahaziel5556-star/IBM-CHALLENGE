import type { ExplainResponse } from "../types/domain";

type InsightOverlayProps = {
  insight: ExplainResponse | null;
};

export function InsightOverlay({ insight }: InsightOverlayProps) {
  if (!insight) {
    return null;
  }

  return (
    <aside className="insight-overlay" aria-live="polite">
      <div className="overlay-topline">
        <p className="overlay-kicker">AI Insight</p>
        <span>{insight.decision.priority_label}</span>
      </div>
      <h3>{insight.headline}</h3>
      <p className="overlay-explanation">{insight.explanation}</p>
      <p className="overlay-decision">{insight.decision.reason}</p>
      <div className="overlay-meta">
        <span>{insight.confidence.toUpperCase()} CONFIDENCE</span>
        {insight.law_reference ? <span>{insight.law_reference}</span> : null}
      </div>
    </aside>
  );
}
