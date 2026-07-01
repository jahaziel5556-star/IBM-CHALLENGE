import { useState, type FormEvent } from "react";

import type { VideoAsset } from "../types/domain";

type VideoIngestPanelProps = {
  activeVideo: VideoAsset | null;
  isUploading: boolean;
  isAnalyzing: boolean;
  onUpload: (videoFile: File, eventsFile?: File) => Promise<void>;
};

export function VideoIngestPanel({ activeVideo, isUploading, isAnalyzing, onUpload }: VideoIngestPanelProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [eventsFile, setEventsFile] = useState<File | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!videoFile) {
      return;
    }
    await onUpload(videoFile, eventsFile ?? undefined);
  }

  return (
    <form className="video-ingest" onSubmit={handleSubmit}>
      <div>
        <p className="section-label">Match Clip</p>
        <h2>Video Overlay Studio</h2>
      </div>

      <label className="file-drop">
        <span>MP4</span>
        <input
          type="file"
          accept="video/mp4,.mp4"
          onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)}
        />
        <strong>{videoFile?.name ?? activeVideo?.filename ?? "Choose clip"}</strong>
      </label>

      <label className="file-drop file-drop-secondary">
        <span>JSON</span>
        <input
          type="file"
          accept="application/json,.json"
          onChange={(event) => setEventsFile(event.target.files?.[0] ?? null)}
        />
        <strong>{eventsFile?.name ?? "Optional timeline"}</strong>
      </label>

      <button className="primary-button" type="submit" disabled={!videoFile || isUploading || isAnalyzing}>
        {isUploading ? "Uploading" : isAnalyzing ? "Analyzing" : "Load Clip"}
      </button>

      {activeVideo ? (
        <div className="video-status">
          <span>{activeVideo.analysis_status.replace(/_/g, " ")}</span>
          <strong>{activeVideo.event_count} events</strong>
        </div>
      ) : null}
    </form>
  );
}
