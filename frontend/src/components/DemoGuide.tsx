import type { DemoScriptStep } from "../types/domain";

type DemoGuideProps = {
  currentMinute: number;
  currentScore: { home: number; away: number };
  isAutoRunning: boolean;
  demoScript: DemoScriptStep[];
  activeEventId?: string;
  onJumpToStep: (eventId: string) => void;
};

export function DemoGuide({
  currentMinute,
  currentScore,
  isAutoRunning,
  demoScript,
  activeEventId,
  onJumpToStep,
}: DemoGuideProps) {
  return (
    <div className="demo-guide">
      <p className="section-label">Judge Demo Flow</p>
      <div className="demo-grid">
        {demoScript.map((item) => (
          <button
            key={item.step}
            className={item.event_id === activeEventId ? "demo-step demo-step-active" : "demo-step"}
            onClick={() => onJumpToStep(item.event_id)}
          >
            <p className="demo-label">
              {item.step}. {item.label}
            </p>
            <p>{item.reason}</p>
          </button>
        ))}
      </div>
      <div className="demo-status">
        <span>{isAutoRunning ? "Demo live" : "Demo paused"}</span>
        <span>
          Match snapshot {currentMinute}' | {currentScore.home}-{currentScore.away}
        </span>
      </div>
    </div>
  );
}
