type DemoGuideProps = {
  currentMinute: number;
  currentScore: { home: number; away: number };
  isAutoRunning: boolean;
};

export function DemoGuide({ currentMinute, currentScore, isAutoRunning }: DemoGuideProps) {
  return (
    <div className="demo-guide">
      <p className="section-label">Judge Demo Flow</p>
      <div className="demo-grid">
        <div>
          <p className="demo-label">1. Start Auto-Run</p>
          <p>Show how the event queue behaves like a producer, not a stats feed.</p>
        </div>
        <div>
          <p className="demo-label">2. Switch Profiles</p>
          <p>Use one event to compare `new_fan`, `analyst`, and accessibility behavior.</p>
        </div>
        <div>
          <p className="demo-label">3. Replay Window</p>
          <p>Explain why the system triggered, what it retrieved, and when it would stay silent.</p>
        </div>
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
