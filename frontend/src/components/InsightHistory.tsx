import type { ExplainResponse, ProfileId } from "../types/domain";

type InsightHistoryEntry = {
  eventId: string;
  profile: ProfileId;
  insight: ExplainResponse;
  minute: number;
  title: string;
};

type InsightHistoryProps = {
  history: InsightHistoryEntry[];
  onSelect: (eventId: string) => void;
};

export function InsightHistory({ history, onSelect }: InsightHistoryProps) {
  return (
    <div className="history-card">
      <p className="section-label">Insight History</p>
      {history.length === 0 ? (
        <p className="sidebar-copy">Explained events will appear here as the broadcast simulation runs.</p>
      ) : (
        <div className="history-list">
          {history.map((entry) => (
            <button key={`${entry.eventId}-${entry.profile}-${entry.minute}`} className="history-item" onClick={() => onSelect(entry.eventId)}>
              <div className="history-topline">
                <span>{entry.minute}'</span>
                <span>{entry.profile.replace("_", " ")}</span>
              </div>
              <strong>{entry.title}</strong>
              <p>{entry.insight.headline}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
