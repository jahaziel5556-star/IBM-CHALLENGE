type VoiceAssistProps = {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  error?: string;
  onToggleListening: () => void;
};

export function VoiceAssist({ isSupported, isListening, transcript, error, onToggleListening }: VoiceAssistProps) {
  return (
    <div className="voice-assist">
      <button
        className={isListening ? "voice-button voice-button-live" : "voice-button"}
        onClick={onToggleListening}
        disabled={!isSupported}
        aria-label={isListening ? "Stop voice assistant" : "Start voice assistant"}
      >
        Mic
      </button>
      <div className="voice-copy">
        <p className="section-label">Voice</p>
        <p>{isSupported ? (isListening ? "Listening for a question..." : 'Try "Why was that offside?"') : "Voice not supported in this browser"}</p>
        {transcript ? <span>{transcript}</span> : null}
        {error ? <span>{error}</span> : null}
      </div>
    </div>
  );
}
