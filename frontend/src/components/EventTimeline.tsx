import type { MatchEvent } from "../types/domain";

type EventTimelineProps = {
  events: MatchEvent[];
  selectedEventId: string;
  onExplain: (eventId: string) => void | Promise<void>;
};

export function EventTimeline({ events, selectedEventId, onExplain }: EventTimelineProps) {
  return (
    <div className="timeline-list">
      {events.map((event) => (
        <button
          key={event.id}
          className={event.id === selectedEventId ? "timeline-card timeline-card-active" : "timeline-card"}
          onClick={() => void onExplain(event.id)}
        >
          <div className="timeline-minute">{event.minute}'</div>
          <div className="timeline-copy">
            <h3>{event.title}</h3>
            <p>{event.summary}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
