import type { SystemSummary } from "../types/domain";

type SystemReadinessProps = {
  summary: SystemSummary | null;
};

export function SystemReadiness({ summary }: SystemReadinessProps) {
  if (!summary) {
    return null;
  }

  return (
    <section className="readiness-card">
      <div className="readiness-header">
        <div>
          <p className="section-label">Demo Readiness</p>
          <h2>System status at a glance</h2>
        </div>
        <div className="readiness-mode">
          <span>{summary.ibm_mode}</span>
          <span>{summary.database_backend}</span>
        </div>
      </div>

      <div className="readiness-grid">
        <div>
          <strong>{summary.match_count}</strong>
          <p>Seeded match</p>
        </div>
        <div>
          <strong>{summary.event_count}</strong>
          <p>Curated events</p>
        </div>
        <div>
          <strong>{summary.rule_count}</strong>
          <p>Event rules</p>
        </div>
        <div>
          <strong>{summary.demo_step_count}</strong>
          <p>Demo steps</p>
        </div>
      </div>

      <p className="readiness-copy">
        Profiles ready: {summary.profiles_supported.join(", ")}.
      </p>
      <p className="readiness-copy">
        Supported events: {summary.event_types_supported.join(", ")}.
      </p>
    </section>
  );
}
