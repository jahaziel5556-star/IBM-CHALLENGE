import type { MatchEvent } from "../types/domain";

type EventTimelineProps = {
  events: MatchEvent[];
  selectedEventId: string;
  queuedEventIds: string[];
  onSelect: (eventId: string) => void | Promise<void>;
};

export function EventTimeline({ events, selectedEventId, queuedEventIds, onSelect }: EventTimelineProps) {
  return (
    <div className="timeline-list">
      {events.map((event) => (
        <button
          key={event.id}
          className={
            event.id === selectedEventId
              ? "timeline-card timeline-card-active"
              : queuedEventIds.includes(event.id)
                ? "timeline-card timeline-card-queued"
                : "timeline-card"
          }
          onClick={() => void onSelect(event.id)}
        >
          <div className="timeline-minute">{event.minute}'</div>
          <div className="timeline-copy">
            <h3>{event.title}</h3>
            <p>{event.summary}</p>
            <div className="timeline-meta">
              <span>P{event.rule.priority}</span>
              <span>{event.rule.prompt_template}</span>
              {queuedEventIds.includes(event.id) ? <span>Queued</span> : <span>Ready</span>}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
