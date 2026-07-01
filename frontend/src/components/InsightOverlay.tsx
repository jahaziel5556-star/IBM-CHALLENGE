import type { ExplainResponse, MatchEvent } from "../types/domain";

type InsightOverlayProps = {
  insight: ExplainResponse | null;
  event?: MatchEvent;
  canRequestInsight: boolean;
  isOpen: boolean;
  isSuggested: boolean;
  onOpen: () => void;
  onClose: () => void;
  onDismiss: () => void;
};

export function InsightOverlay({
  insight,
  event,
  canRequestInsight,
  isOpen,
  isSuggested,
  onOpen,
  onClose,
  onDismiss,
}: InsightOverlayProps) {
  if (!insight && !canRequestInsight) {
    return null;
  }

  return (
    <>
      {!isOpen ? (
        <div className={isSuggested ? "insight-prompt insight-prompt-suggested" : "insight-prompt"}>
          <button className="insight-fab" onClick={onOpen} aria-label="Open Match Insights">
            i
          </button>
          {isSuggested && insight ? (
            <button className="insight-nudge" onClick={onOpen}>
              <strong>Need an explanation?</strong>
              <span>{insight.headline}</span>
            </button>
          ) : null}
        </div>
      ) : null}

      {isOpen ? <button className="insight-scrim" onClick={onClose} aria-label="Close Match Insights panel" /> : null}

      {insight ? (
        <aside className={isOpen ? "insight-drawer insight-drawer-open" : "insight-drawer"} aria-live="polite">
        <div className="insight-drawer-header">
          <div>
            <p className="overlay-kicker">Match Insights</p>
            <h3>{insight.headline}</h3>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close insights">
            Close
          </button>
        </div>

        <div className="insight-drawer-meta">
          <span>{insight.decision.priority_label}</span>
          <span>{insight.confidence}</span>
          {event ? <span>{event.minute}'</span> : null}
          {insight.law_reference ? <span>{insight.law_reference}</span> : null}
        </div>

        <div className="insight-drawer-section">
          <p className="insight-drawer-label">Simple explanation</p>
          <p className="insight-drawer-body">{insight.explanation}</p>
        </div>

        <div className="insight-drawer-section">
          <p className="insight-drawer-label">Why this was surfaced</p>
          <p className="insight-drawer-body">{insight.why_now}</p>
        </div>

        {insight.evidence.length > 0 ? (
          <div className="insight-drawer-section">
            <p className="insight-drawer-label">Evidence</p>
            <div className="overlay-evidence">
              {insight.evidence.map((item) => (
                <span key={item} className="evidence-chip">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {event?.cv_evidence ? (
          <div className="insight-drawer-section">
            <p className="insight-drawer-label">Replay breakdown</p>
            <p className="insight-drawer-body">
              Motion {event.cv_evidence.motion_score?.toFixed(2) ?? "0.00"} | Pitch{" "}
              {event.cv_evidence.pitch_ratio?.toFixed(2) ?? "0.00"} | Scene{" "}
              {event.cv_evidence.scene_change?.toFixed(2) ?? "0.00"}
            </p>
          </div>
        ) : null}

        <div className="insight-drawer-footer">
          <button className="secondary-button" onClick={onDismiss}>
            Dismiss
          </button>
        </div>
        </aside>
      ) : null}
    </>
  );
}
