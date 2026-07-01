import { useEffect, useState } from "react";

import { apiAssetUrl, apiGet, apiPost, apiUpload } from "./api/client";
import { EventTimeline } from "./components/EventTimeline";
import { HeaderBar } from "./components/HeaderBar";
import { InsightOverlay } from "./components/InsightOverlay";
import { MatchStage } from "./components/MatchStage";
import { ProfileSwitcher } from "./components/ProfileSwitcher";
import { SettingsPanel } from "./components/SettingsPanel";
import { StateNotice } from "./components/StateNotice";
import { VideoIngestPanel } from "./components/VideoIngestPanel";
import type {
  DemoScriptStep,
  ExplainResponse,
  HealthResponse,
  MatchEvent,
  MatchSummary,
  ProfileId,
  ProfileSettings,
  SystemSummary,
  VideoAnalysisResponse,
  VideoAsset,
} from "./types/domain";

const profiles: ProfileId[] = ["new_fan", "casual_viewer", "analyst", "child", "accessibility"];

function findClosestVideoEvent(events: MatchEvent[], seconds: number) {
  const timedEvents = events
    .filter((event) => typeof event.timestamp_seconds === "number")
    .sort((left, right) => Number(left.timestamp_seconds) - Number(right.timestamp_seconds));

  if (timedEvents.length === 0) {
    return undefined;
  }

  const passedEvent = [...timedEvents].reverse().find((event) => Number(event.timestamp_seconds) <= seconds + 0.4);
  return passedEvent ?? timedEvents[0];
}

export default function App() {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [profile, setProfile] = useState<ProfileId>("new_fan");
  const [activeInsight, setActiveInsight] = useState<ExplainResponse | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>("evt-penalty-62");
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    profile: "new_fan",
    language: "en",
    large_text: false,
    high_contrast: false,
    reduced_motion: false,
  });
  const [videoTriggeredEventIds, setVideoTriggeredEventIds] = useState<string[]>([]);
  const [lastExplainedMinute, setLastExplainedMinute] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [health, setHealth] = useState<HealthResponse>({
    status: "unknown",
    service: "matchmind-one-api",
    ibm_mode: "mock",
    database_backend: "sqlite",
  });
  const [, setDemoScript] = useState<DemoScriptStep[]>([]);
  const [, setSystemSummary] = useState<SystemSummary | null>(null);
  const [videos, setVideos] = useState<VideoAsset[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoAsset | null>(null);
  const [isInsightDrawerOpen, setIsInsightDrawerOpen] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    async function loadApp() {
      try {
        setIsLoading(true);
        const [healthResponse, loadedMatches, loadedProfile, loadedDemoScript, loadedSystemSummary, loadedVideos] = await Promise.all([
          apiGet<HealthResponse>("/health"),
          apiGet<MatchSummary[]>("/api/matches"),
          apiGet<ProfileSettings>("/api/profile"),
          apiGet<DemoScriptStep[]>("/api/demo-script"),
          apiGet<SystemSummary>("/api/system/summary"),
          apiGet<VideoAsset[]>("/api/videos"),
        ]);
        setHealth(healthResponse);
        setMatches(loadedMatches);
        setProfile(loadedProfile.profile);
        setProfileSettings(loadedProfile);
        setDemoScript(loadedDemoScript);
        setSystemSummary(loadedSystemSummary);
        setVideos(loadedVideos);

        const latestVideo = loadedVideos[0];
        if (latestVideo) {
          setActiveVideo(latestVideo);
          if (latestVideo.event_count > 0) {
            const uploadedEvents = await apiGet<MatchEvent[]>(`/api/videos/${latestVideo.id}/events`);
            setEvents(uploadedEvents);
            setSelectedEventId(uploadedEvents[0]?.id ?? "");
          }
        } else if (loadedMatches[0]) {
          const primaryMatch = loadedMatches[0];
          const loadedEvents = await apiGet<MatchEvent[]>(`/api/matches/${primaryMatch.id}/events`);
          setEvents(loadedEvents);
        }
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to load MatchMind One.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadApp();
  }, []);

  async function handleExplain(
    eventId: string,
    options?: { fromVideoRun?: boolean; requestProfile?: ProfileId; openDrawer?: boolean },
  ) {
    if (!eventId) {
      return;
    }

    setSelectedEventId(eventId);
    try {
      const activeProfile = options?.requestProfile ?? profile;
      const insight = await apiPost<ExplainResponse>("/api/explain", { profile: activeProfile, event_id: eventId });
      const event = events.find((item) => item.id === eventId);
      if (event) {
        setLastExplainedMinute(event.minute);
      }
      setActiveInsight(insight);
      setIsInsightDrawerOpen(options?.openDrawer ?? !options?.fromVideoRun);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Insight generation failed.");
    }
  }

  async function handleProfileChange(nextProfile: ProfileId) {
    setProfile(nextProfile);
    const nextSettings = { ...profileSettings, profile: nextProfile };
    setProfileSettings(nextSettings);
    await apiPost("/api/profile", nextSettings);
    if (selectedEventId && activeInsight) {
      void handleExplain(selectedEventId, { requestProfile: nextProfile, openDrawer: isInsightDrawerOpen });
    }
  }

  async function handleToggleSetting(field: "large_text" | "high_contrast" | "reduced_motion", value: boolean) {
    const nextSettings = { ...profileSettings, profile, [field]: value };
    setProfileSettings(nextSettings);
    await apiPost("/api/profile", nextSettings);
  }

  async function handleVideoUpload(videoFile: File, eventsFile?: File) {
    const formData = new FormData();
    formData.append("video", videoFile);
    if (eventsFile) {
      formData.append("events", eventsFile);
    }

    try {
      setIsUploadingVideo(true);
      setErrorMessage("");
      const uploadedVideo = await apiUpload<VideoAsset>("/api/videos/upload", formData);
      setVideos((current) => [uploadedVideo, ...current.filter((video) => video.id !== uploadedVideo.id)]);
      setActiveVideo(uploadedVideo);
      setActiveInsight(null);
      setIsInsightDrawerOpen(false);
      setVideoTriggeredEventIds([]);
      setVideoCurrentTime(0);
      setVideoDuration(0);
      setIsVideoPlaying(false);
      if (uploadedVideo.event_count > 0) {
        await loadVideoEvents(uploadedVideo);
      } else {
        setEvents([]);
        setSelectedEventId("");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Video upload failed.");
    } finally {
      setIsUploadingVideo(false);
    }
  }

  async function loadVideoEvents(video: VideoAsset) {
    const uploadedEvents = await apiGet<MatchEvent[]>(`/api/videos/${video.id}/events`);
    setEvents(uploadedEvents);
    setSelectedEventId(uploadedEvents[0]?.id ?? "");
    setLastExplainedMinute(uploadedEvents[0]?.minute ?? null);
  }

  async function handleAnalyzeVideo(duration: number) {
    setVideoDuration(duration);

    if (!activeVideo || activeVideo.event_count > 0 || isAnalyzingVideo) {
      return;
    }

    try {
      setIsAnalyzingVideo(true);
      const analysis = await apiPost<VideoAnalysisResponse>(`/api/videos/${activeVideo.id}/analyze`, {
        duration_seconds: Number.isFinite(duration) ? duration : undefined,
      });
      setActiveVideo(analysis.video);
      setVideos((current) => [analysis.video, ...current.filter((video) => video.id !== analysis.video.id)]);
      setEvents(analysis.events);
      setSelectedEventId(analysis.events[0]?.id ?? "");
      setVideoTriggeredEventIds([]);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Video analysis failed.");
    } finally {
      setIsAnalyzingVideo(false);
    }
  }

  function handleVideoSeek(seconds: number) {
    setVideoCurrentTime(seconds);
    setIsVideoPlaying(false);
    setActiveInsight(null);
    setIsInsightDrawerOpen(false);

    const timedEvents = events.filter((event) => event.video_id === activeVideo?.id && typeof event.timestamp_seconds === "number");
    const closestEvent = findClosestVideoEvent(timedEvents, seconds);
    if (closestEvent) {
      setSelectedEventId(closestEvent.id);
      setLastExplainedMinute(closestEvent.minute);
    }

    setVideoTriggeredEventIds(
      timedEvents
        .filter((event) => Number(event.timestamp_seconds) <= seconds + 0.4)
        .map((event) => event.id),
    );
  }

  function handleVideoTimeUpdate(currentTime: number) {
    setVideoCurrentTime((previous) => {
      if (currentTime + 0.5 < previous) {
        const timedEvents = events.filter((event) => event.video_id === activeVideo?.id && typeof event.timestamp_seconds === "number");
        setVideoTriggeredEventIds(
          timedEvents
            .filter((event) => Number(event.timestamp_seconds) <= currentTime + 0.4)
            .map((event) => event.id),
        );
      }
      return currentTime;
    });

    const visibleEvent = findClosestVideoEvent(events.filter((event) => event.video_id === activeVideo?.id), currentTime);
    if (visibleEvent) {
      setSelectedEventId(visibleEvent.id);
      setLastExplainedMinute(visibleEvent.minute);
    }

    if (!activeVideo || activeInsight || events.length === 0) {
      return;
    }

    const dueEvent = events
      .filter((event) => event.video_id === activeVideo.id)
      .filter((event) => typeof event.timestamp_seconds === "number")
      .filter((event) => Number(event.timestamp_seconds) <= currentTime + 0.4)
      .filter((event) => !videoTriggeredEventIds.includes(event.id))
      .filter((event) => !event.silent_recommended)
      .sort((left, right) => Number(left.timestamp_seconds) - Number(right.timestamp_seconds))[0];

    if (!dueEvent) {
      return;
    }

    setVideoTriggeredEventIds((current) => [...new Set([...current, dueEvent.id])]);
    void handleExplain(dueEvent.id, { fromVideoRun: true });
  }

  function handleSelectEvent(eventId: string) {
    const event = events.find((item) => item.id === eventId);
    if (event && typeof event.timestamp_seconds === "number") {
      handleVideoSeek(Number(event.timestamp_seconds));
    }
    void handleExplain(eventId, { openDrawer: true });
  }

  const selectedEvent = events.find((event) => event.id === selectedEventId);
  const liveMinute = selectedEvent?.minute ?? lastExplainedMinute ?? 1;
  const liveScore = events
    .filter((event) => event.type === "goal" && event.minute <= liveMinute)
    .reduce(
      (score, event) => {
        if (event.team === matches[0]?.home_team) {
          return { ...score, home: score.home + 1 };
        }
        if (event.team === matches[0]?.away_team) {
          return { ...score, away: score.away + 1 };
        }
        return score;
      },
      { home: 0, away: 0 },
    );

  return (
    <div
      className={
        profileSettings.high_contrast
          ? "app-shell app-shell-high-contrast"
          : profileSettings.large_text
            ? "app-shell app-shell-large-text"
            : "app-shell"
      }
    >
      <div className="background-glow background-glow-left" />
      <div className="background-glow background-glow-right" />

      <HeaderBar
        serviceMode={health.ibm_mode}
        databaseBackend={health.database_backend}
        isHealthy={health.status === "ok"}
      />

      <main className="broadcast-layout">
        <section className="broadcast-intro">
          <div>
            <p className="eyebrow">AI Understanding Layer</p>
            <h1>Keep the match front and center.</h1>
            <p className="lede">
              MatchMind One stays quiet until a moment becomes genuinely confusing, then offers a clean explanation without taking over the screen.
            </p>
          </div>

          <div className="broadcast-toolbar">
            <ProfileSwitcher profiles={profiles} activeProfile={profile} onChange={handleProfileChange} />
            <SettingsPanel settings={profileSettings} onToggle={handleToggleSetting} />
            <VideoIngestPanel
              activeVideo={activeVideo}
              isUploading={isUploadingVideo}
              isAnalyzing={isAnalyzingVideo}
              onUpload={handleVideoUpload}
            />
          </div>
        </section>

        <section className="broadcast-stage-shell">
          {errorMessage ? <StateNotice title="System Notice" message={errorMessage} tone="error" /> : null}
          {isLoading ? <StateNotice title="Loading Broadcast" message="Fetching match context and clip state." /> : null}

          <MatchStage
            match={matches[0]}
            activeEvent={selectedEvent}
            liveMinute={liveMinute}
            liveScore={liveScore}
            videoUrl={activeVideo ? apiAssetUrl(activeVideo.video_url) : undefined}
            videoTitle={activeVideo?.filename}
            timelineSource={activeVideo?.timeline_source}
            videoCurrentTime={videoCurrentTime}
            videoDuration={videoDuration}
            isVideoPlaying={isVideoPlaying}
            onTogglePlayback={() => setIsVideoPlaying((current) => !current)}
            onVideoSeek={handleVideoSeek}
            onVideoLoadedMetadata={handleAnalyzeVideo}
            onVideoTimeUpdate={handleVideoTimeUpdate}
            onVideoPlayStateChange={setIsVideoPlaying}
          />

          <InsightOverlay
            insight={activeInsight}
            event={selectedEvent}
            isOpen={isInsightDrawerOpen}
            onOpen={() => setIsInsightDrawerOpen(true)}
            onClose={() => setIsInsightDrawerOpen(false)}
            onDismiss={() => {
              setActiveInsight(null);
              setIsInsightDrawerOpen(false);
            }}
          />
        </section>

        <section className="broadcast-moments">
          <div className="moments-header">
            <div>
              <p className="section-label">Moments</p>
              <h2>Key moments worth explaining</h2>
            </div>
            <button className="primary-button" onClick={() => void handleExplain(selectedEventId, { openDrawer: true })} disabled={!selectedEventId}>
              Open Match Insight
            </button>
          </div>

          {!isLoading && events.length === 0 ? (
            <StateNotice title="No Events Yet" message="Upload a clip or wait for AI analysis to find moments worth explaining." />
          ) : null}

          <EventTimeline
            events={events}
            selectedEventId={selectedEventId}
            queuedEventIds={videoTriggeredEventIds}
            onExplain={handleSelectEvent}
          />
        </section>
      </main>
    </div>
  );
}
