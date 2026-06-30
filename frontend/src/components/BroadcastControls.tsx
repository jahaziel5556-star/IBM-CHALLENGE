type BroadcastControlsProps = {
  isAutoRunning: boolean;
  queueLength: number;
  onStart: () => void;
  onStop: () => void;
};

export function BroadcastControls({ isAutoRunning, queueLength, onStart, onStop }: BroadcastControlsProps) {
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
        <div className="queue-pill">{queueLength} queued</div>
      </div>
    </div>
  );
}
