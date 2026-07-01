import { useEffect } from "react";

import type { ExplainResponse, MatchEvent } from "../types/domain";

type InsightOverlayProps = {
  drawerInsight: ExplainResponse | null;
  event?: MatchEvent;
  canRequestInsight: boolean;
  isDrawerOpen: boolean;
  isSuggested: boolean;
  onOpen: () => void;
  onClose: () => void;
  onDismiss: () => void;
};

export function InsightOverlay({
  drawerInsight,
  event,
  canRequestInsight,
  isDrawerOpen,
  isSuggested,
  onOpen,
  onClose,
  onDismiss,
}: InsightOverlayProps) {
  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isDrawerOpen, onClose]);

  if (!drawerInsight && !canRequestInsight) {
    return null;
  }

  return (
    <>
      {!isDrawerOpen ? (
        <div className="insight-prompt">
          {isSuggested && drawerInsight ? (
            <button className="insight-nudge" onClick={onOpen}>
              <strong>Need an explanation?</strong>
              <span>View</span>
            </button>
          ) : null}
          {canRequestInsight ? (
            <button className="insight-fab" onClick={onOpen} aria-label="Open Match Insights">
              ⓘ
            </button>
          ) : null}
        </div>
      ) : null}

      {isDrawerOpen ? <button className="insight-scrim" onClick={onClose} aria-label="Close Match Insights panel" /> : null}

      {drawerInsight ? (
        <aside className={isDrawerOpen ? "insight-drawer insight-drawer-open" : "insight-drawer"} aria-live="polite">
          <div className="insight-drawer-header">
            <div>
              <p className="overlay-kicker">Match Insights</p>
              <h3>{drawerInsight.headline}</h3>
            </div>
            <button className="drawer-close" onClick={onClose} aria-label="Close insights">
              Close
            </button>
          </div>

          <div className="insight-drawer-meta">
            <span>{drawerInsight.decision.priority_label}</span>
            <span>{drawerInsight.confidence}</span>
            {event ? <span>{event.minute}'</span> : null}
            {drawerInsight.law_reference ? <span>{drawerInsight.law_reference}</span> : null}
          </div>

          <div className="insight-drawer-section">
            <p className="insight-drawer-label">Simple explanation</p>
            <p className="insight-drawer-body">{drawerInsight.explanation}</p>
          </div>

          <div className="insight-drawer-section">
            <p className="insight-drawer-label">Why this was surfaced</p>
            <p className="insight-drawer-body">{drawerInsight.why_now}</p>
          </div>

          {drawerInsight.evidence.length > 0 ? (
            <div className="insight-drawer-section">
              <p className="insight-drawer-label">Evidence</p>
              <div className="overlay-evidence">
                {drawerInsight.evidence.map((item) => (
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
