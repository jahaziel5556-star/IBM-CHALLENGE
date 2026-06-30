type BroadcastControlsProps = {
  isAutoRunning: boolean;
  isDemoRunning: boolean;
  queueLength: number;
  onStart: () => void;
  onStartDemo: () => void;
  onStop: () => void;
};

export function BroadcastControls({
  isAutoRunning,
  isDemoRunning,
  queueLength,
  onStart,
  onStartDemo,
  onStop,
}: BroadcastControlsProps) {
  return (
    <div className="broadcast-controls">
      <div>
        <p className="section-label">Broadcast Simulation</p>
        <p className="sidebar-copy">
          Auto-run steps through the event timeline and lets the overlay engine surface insights like a live production.
        </p>
      </div>

      <div className="broadcast-control-row">
        <button className="primary-button" onClick={isAutoRunning ? onStop : onStart}>
          {isAutoRunning ? "Stop Auto-Run" : "Start Auto-Run"}
        </button>
        <button className="secondary-button" onClick={isAutoRunning ? onStop : onStartDemo}>
          {isDemoRunning ? "Stop Demo Mode" : "Start Demo Mode"}
        </button>
        <div className="queue-pill">{queueLength} queued</div>
      </div>
    </div>
  );
}
