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
      <p className="overlay-kicker">AI Insight</p>
      <h3>{insight.headline}</h3>
      <p>{insight.explanation}</p>
      <p className="overlay-support">{insight.why_now}</p>
      <div className="overlay-evidence">
        {insight.evidence.map((item) => (
          <span key={item} className="evidence-chip">
            {item}
          </span>
        ))}
      </div>
      <div className="overlay-meta">
        <span>{insight.confidence.toUpperCase()} CONFIDENCE</span>
        {insight.law_reference ? <span>{insight.law_reference}</span> : null}
        <span>{insight.prompt_template}</span>
      </div>
    </aside>
  );
}
