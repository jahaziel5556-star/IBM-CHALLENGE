import type { DemoScriptStep } from "../types/domain";

type DemoGuideProps = {
  currentMinute: number;
  currentScore: { home: number; away: number };
  isAutoRunning: boolean;
  demoScript: DemoScriptStep[];
};

export function DemoGuide({ currentMinute, currentScore, isAutoRunning, demoScript }: DemoGuideProps) {
  return (
    <div className="demo-guide">
      <p className="section-label">Judge Demo Flow</p>
      <div className="demo-grid">
        {demoScript.map((item) => (
          <div key={item.step}>
            <p className="demo-label">
              {item.step}. {item.label}
            </p>
            <p>{item.reason}</p>
          </div>
        ))}
      </div>
      <div className="demo-status">
        <span>{isAutoRunning ? "Demo live" : "Demo paused"}</span>
        <span>
          Match snapshot {currentMinute}' • {currentScore.home}-{currentScore.away}
        </span>
      </div>
    </div>
  );
}
