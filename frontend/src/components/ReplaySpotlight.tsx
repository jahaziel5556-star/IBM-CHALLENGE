import type { MatchEvent } from "../types/domain";

type ReplaySpotlightProps = {
  event?: MatchEvent;
};

export function ReplaySpotlight({ event }: ReplaySpotlightProps) {
  if (!event) {
    return (
      <div className="replay-card">
        <p className="section-label">Replay Window</p>
        <h3>Awaiting match event</h3>
        <p className="sidebar-copy">Choose an event from the timeline or start auto-run to simulate a live sequence.</p>
      </div>
    );
  }

  return (
    <div className="replay-card">
      <p className="section-label">Replay Window</p>
      <div className="replay-header">
        <h3>{event.title}</h3>
        <span className="replay-minute">{event.minute}'</span>
      </div>
      <p className="replay-summary">{event.summary}</p>
      <div className="replay-grid">
        {event.analysis_source ? (
          <div>
            <p className="replay-label">Analysis Source</p>
            <p>{event.analysis_source.replace(/_/g, " ")}</p>
          </div>
        ) : null}
        {event.cv_evidence ? (
          <div>
            <p className="replay-label">CV Evidence</p>
            <p>
              Motion {event.cv_evidence.motion_score?.toFixed(2) ?? "0.00"} | Pitch{" "}
              {event.cv_evidence.pitch_ratio?.toFixed(2) ?? "0.00"} | Scene{" "}
              {event.cv_evidence.scene_change?.toFixed(2) ?? "0.00"}
            </p>
          </div>
        ) : null}
        <div>
          <p className="replay-label">Prompt Path</p>
          <p>{event.rule.prompt_template}</p>
        </div>
        <div>
          <p className="replay-label">Why Trigger</p>
          <p>{event.rule.trigger_summary}</p>
        </div>
        <div>
          <p className="replay-label">Stay Silent When</p>
          <p>{event.rule.silence_summary}</p>
        </div>
        <div>
          <p className="replay-label">Retrieval</p>
          <p>{event.rule.retrieval_sources.join(", ")}</p>
        </div>
      </div>
    </div>
  );
}
