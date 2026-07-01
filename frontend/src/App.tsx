import { useEffect, useMemo, useRef, useState } from "react";

import { apiAssetUrl, apiGet, apiPost, apiUpload } from "./api/client";
import { EventTimeline } from "./components/EventTimeline";
import { HeaderBar } from "./components/HeaderBar";
import { InsightOverlay } from "./components/InsightOverlay";
import { MatchStage } from "./components/MatchStage";
import { ProfileSwitcher } from "./components/ProfileSwitcher";
import { SettingsPanel } from "./components/SettingsPanel";
import { StateNotice } from "./components/StateNotice";
import { VideoIngestPanel } from "./components/VideoIngestPanel";
import { VoiceAssist } from "./components/VoiceAssist";
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
const ALWAYS_EXPLAINABLE_TYPES = new Set(["var_review", "goal_disallowed", "penalty", "no_penalty", "red_card"]);
const CONDITIONAL_EXPLAINABLE_TYPES = new Set([
  "offside",
  "yellow_card",
  "momentum_shift",
  "tactical_formation_change",
  "defensive_block_change",
  "substitution",
]);
const SOMETIMES_SILENT_TYPES = new Set(["dangerous_attack", "counterattack", "injury", "high_press_detected"]);
const AUTO_OVERLAY_TYPES = new Set(["var_review", "goal_disallowed", "penalty", "no_penalty", "red_card"]);

type SpeechRecognitionCtor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function sortTimedEvents(events: MatchEvent[]) {
  return [...events]
    .filter((event) => typeof event.timestamp_seconds === "number")
    .sort((left, right) => Number(left.timestamp_seconds) - Number(right.timestamp_seconds));
}

function shouldOfferInsight(event: MatchEvent | undefined) {
  if (!event || event.silent_recommended) {
    return false;
  }

  if (ALWAYS_EXPLAINABLE_TYPES.has(event.type)) {
    return true;
  }
  if (CONDITIONAL_EXPLAINABLE_TYPES.has(event.type)) {
    return event.rule.priority >= 70;
  }
  if (SOMETIMES_SILENT_TYPES.has(event.type)) {
    return event.rule.priority >= 80;
  }
  return event.rule.priority >= 85;
}

function shouldAutoOverlay(event: MatchEvent | undefined) {
  if (!event || event.silent_recommended) {
    return false;
  }

  if (AUTO_OVERLAY_TYPES.has(event.type)) {
    return true;
  }

  if (event.type === "offside") {
    return event.rule.priority >= 85;
  }

  return event.rule.priority >= 92;
}

function findRailEvent(events: MatchEvent[], seconds: number) {
  const timed = sortTimedEvents(events);
  if (timed.length === 0) {
    return undefined;
  }

  const current = [...timed].reverse().find((event) => Number(event.timestamp_seconds) <= seconds + 0.1);
  if (current) {
    return current;
  }

  return timed[0];
}

function resolveVoiceEvent(question: string, events: MatchEvent[], selectedEvent?: MatchEvent) {
  const normalized = question.toLowerCase();
  const explainable = events.filter((event) => shouldOfferInsight(event));
  const checks: Array<[string[], (event: MatchEvent) => boolean]> = [
    [["penalty"], (event) => ["penalty", "no_penalty"].includes(event.type)],
    [["offside", "disallowed"], (event) => ["offside", "goal_disallowed"].includes(event.type)],
    [["var", "review"], (event) => event.type === "var_review"],
    [["red card", "sent off"], (event) => event.type === "red_card"],
    [["yellow card", "booking"], (event) => event.type === "yellow_card"],
    [["substitution", "sub"], (event) => event.type === "substitution"],
  ];

  for (const [keywords, predicate] of checks) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      const matched = explainable.find(predicate);
      if (matched) {
        return matched;
      }
    }
  }

  return selectedEvent && shouldOfferInsight(selectedEvent) ? selectedEvent : explainable[0];
}

export default function App() {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [profile, setProfile] = useState<ProfileId>("new_fan");
  const [selectedEventId, setSelectedEventId] = useState<string>("evt-penalty-62");
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    profile: "new_fan",
    language: "en",
    large_text: false,
    high_contrast: false,
    reduced_motion: false,
  });
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
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const [drawerInsight, setDrawerInsight] = useState<ExplainResponse | null>(null);
  const [transientInsight, setTransientInsight] = useState<ExplainResponse | null>(null);
  const [shownEventIds, setShownEventIds] = useState<string[]>([]);
  const [pendingOverlayEventIds, setPendingOverlayEventIds] = useState<string[]>([]);
  const lastPlaybackTimeRef = useRef(0);

  const explainableEvents = useMemo(() => events.filter((event) => shouldOfferInsight(event)), [events]);
  const autoOverlayEvents = useMemo(() => explainableEvents.filter((event) => shouldAutoOverlay(event)), [explainableEvents]);
  const timedAutoOverlayEvents = useMemo(() => sortTimedEvents(autoOverlayEvents), [autoOverlayEvents]);
  const selectedEvent = events.find((event) => event.id === selectedEventId);

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

  useEffect(() => {
    const recognitionAvailable =
      typeof window !== "undefined" &&
      Boolean(
        (window as Window & { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition ||
          (window as Window & { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition,
      );
    setIsVoiceSupported(recognitionAvailable);
  }, []);

  useEffect(() => {
    if (!transientInsight) {
      return;
    }

    const timeout = window.setTimeout(() => setTransientInsight(null), transientInsight.overlay.duration_seconds * 1000);
    return () => window.clearTimeout(timeout);
  }, [transientInsight]);

  useEffect(() => {
    if (transientInsight || pendingOverlayEventIds.length === 0) {
      return;
    }

    const nextEventId = pendingOverlayEventIds[0];
    void handleExplain(nextEventId, { fromVideoRun: true, showTransient: true });
  }, [pendingOverlayEventIds, transientInsight]);

  useEffect(() => {
    function handleWindowKeydown(event: KeyboardEvent) {
      if (!activeVideo || !videoDuration) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName)) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleSkipBy(30);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handleSkipBy(-30);
      }
    }

    window.addEventListener("keydown", handleWindowKeydown);
    return () => window.removeEventListener("keydown", handleWindowKeydown);
  }, [activeVideo, videoDuration, videoCurrentTime]);

  async function handleExplain(
    eventId: string,
    options?: {
      fromVideoRun?: boolean;
      requestProfile?: ProfileId;
      openDrawer?: boolean;
      speakAnswer?: boolean;
      showTransient?: boolean;
    },
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

      if (options?.openDrawer) {
        setDrawerInsight(insight);
        setIsInsightDrawerOpen(true);
      }

      if (options?.showTransient) {
        setTransientInsight(insight);
        setDrawerInsight((current) => (current?.event_id === eventId ? current : insight));
        setPendingOverlayEventIds((current) => current.filter((queuedId) => queuedId !== eventId));
        setShownEventIds((current) => [...new Set([...current, eventId])]);
      }

      if (options?.speakAnswer && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(insight.explanation));
      }

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
    if (selectedEventId && drawerInsight) {
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
      setDrawerInsight(null);
      setTransientInsight(null);
      setIsInsightDrawerOpen(false);
      setShownEventIds([]);
      setPendingOverlayEventIds([]);
      setVideoCurrentTime(0);
      setVideoDuration(0);
      setIsVideoPlaying(false);
      lastPlaybackTimeRef.current = 0;
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
      setShownEventIds([]);
      setPendingOverlayEventIds([]);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Video analysis failed.");
    } finally {
      setIsAnalyzingVideo(false);
    }
  }

  function resetPlaybackStateAt(seconds: number) {
    const alreadyPast = timedAutoOverlayEvents
      .filter((event) => Number(event.timestamp_seconds) <= seconds + 0.05)
      .map((event) => event.id);
    setShownEventIds(alreadyPast);
    setPendingOverlayEventIds([]);
    setTransientInsight(null);
  }

  function handleVideoSeek(seconds: number) {
    const boundedTime = Math.max(0, Math.min(seconds, videoDuration || seconds));
    setVideoCurrentTime(boundedTime);
    setIsVideoPlaying(false);
    resetPlaybackStateAt(boundedTime);
    lastPlaybackTimeRef.current = boundedTime;

    const contextEvent = findRailEvent(explainableEvents, boundedTime);
    if (contextEvent) {
      setSelectedEventId(contextEvent.id);
      setLastExplainedMinute(contextEvent.minute);
    }
  }

  function handleSkipBy(offsetSeconds: number) {
    handleVideoSeek(videoCurrentTime + offsetSeconds);
  }

  function handleVideoTimeUpdate(currentTime: number) {
    const previousTime = lastPlaybackTimeRef.current;
    lastPlaybackTimeRef.current = currentTime;
    setVideoCurrentTime(currentTime);

    const contextEvent = findRailEvent(explainableEvents, currentTime);
    if (contextEvent) {
      setSelectedEventId(contextEvent.id);
      setLastExplainedMinute(contextEvent.minute);
    }

    if (!activeVideo || timedAutoOverlayEvents.length === 0) {
      return;
    }

    if (currentTime + 0.2 < previousTime) {
      resetPlaybackStateAt(currentTime);
      return;
    }

    const crossedEvents = timedAutoOverlayEvents
      .filter((event) => !shownEventIds.includes(event.id))
      .filter((event) => !pendingOverlayEventIds.includes(event.id))
      .filter((event) => {
        const timestamp = Number(event.timestamp_seconds);
        return timestamp > previousTime && timestamp <= currentTime;
      })
      .map((event) => event.id);

    if (crossedEvents.length > 0) {
      setPendingOverlayEventIds((current) => [...current, ...crossedEvents]);
    }
  }

  async function handleSelectEvent(eventId: string) {
    const event = explainableEvents.find((item) => item.id === eventId);
    if (event && typeof event.timestamp_seconds === "number") {
      handleVideoSeek(Number(event.timestamp_seconds));
    }
    setSelectedEventId(eventId);
    setLastExplainedMinute(event?.minute ?? null);
    if (!event) {
      setIsInsightDrawerOpen(false);
      return;
    }

    if (drawerInsight?.event_id === eventId) {
      setIsInsightDrawerOpen(true);
      return;
    }

    await handleExplain(eventId, { openDrawer: true });
  }

  function handleToggleVoiceAssistant() {
    if (!isVoiceSupported || typeof window === "undefined") {
      return;
    }

    const host = window as Window & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
      __matchmindRecognition?: InstanceType<SpeechRecognitionCtor>;
    };
    const Recognition = host.SpeechRecognition ?? host.webkitSpeechRecognition;
    if (!Recognition) {
      return;
    }

    if (isListening) {
      host.__matchmindRecognition?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new Recognition();
    host.__matchmindRecognition = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    setVoiceError("");
    setVoiceTranscript("");
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      setVoiceTranscript(transcript);
      const matchedEvent = resolveVoiceEvent(transcript, explainableEvents, selectedEvent);
      if (matchedEvent) {
        setSelectedEventId(matchedEvent.id);
        setLastExplainedMinute(matchedEvent.minute);
        void handleExplain(matchedEvent.id, { speakAnswer: true, showTransient: true });
      }
    };
    recognition.onerror = (event) => {
      setVoiceError(event.error === "not-allowed" ? "Microphone permission denied" : `Voice error: ${event.error}`);
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.start();
  }

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

      <main className="watch-page">
        <section className="watch-utility-bar">
          <ProfileSwitcher profiles={profiles} activeProfile={profile} onChange={handleProfileChange} />
          <SettingsPanel settings={profileSettings} onToggle={handleToggleSetting} />
          <VoiceAssist
            isSupported={isVoiceSupported}
            isListening={isListening}
            transcript={voiceTranscript}
            error={voiceError}
            onToggleListening={handleToggleVoiceAssistant}
          />
          <VideoIngestPanel
            activeVideo={activeVideo}
            isUploading={isUploadingVideo}
            isAnalyzing={isAnalyzingVideo}
            onUpload={handleVideoUpload}
          />
        </section>

        <section className="watch-stage-panel">
          {errorMessage ? <StateNotice title="System Notice" message={errorMessage} tone="error" /> : null}
          {isLoading ? <StateNotice title="Loading Broadcast" message="Fetching match context and clip state." /> : null}

          <MatchStage
            match={matches[0]}
            liveScore={liveScore}
            videoUrl={activeVideo ? apiAssetUrl(activeVideo.video_url) : undefined}
            videoCurrentTime={videoCurrentTime}
            videoDuration={videoDuration}
            isVideoPlaying={isVideoPlaying}
            transientInsight={transientInsight}
            onTogglePlayback={() => setIsVideoPlaying((current) => !current)}
            onVideoSeek={handleVideoSeek}
            onSkipBy={handleSkipBy}
            onVideoLoadedMetadata={handleAnalyzeVideo}
            onVideoTimeUpdate={handleVideoTimeUpdate}
            onVideoPlayStateChange={setIsVideoPlaying}
          />

          <InsightOverlay
            drawerInsight={drawerInsight}
            event={selectedEvent}
            isDrawerOpen={isInsightDrawerOpen}
            onClose={() => setIsInsightDrawerOpen(false)}
            onDismiss={() => {
              setDrawerInsight(null);
              setTransientInsight(null);
              setIsInsightDrawerOpen(false);
            }}
          />
        </section>

        <section className="watch-moments-rail">
          <div className="moments-header">
            <div>
              <p className="section-label">Moments</p>
              <h2>Explainable moments</h2>
            </div>
            <p className="moments-hint">Use the slider or arrow keys to move through the clip. Click any explainable moment below when you want the full breakdown.</p>
          </div>

          {!isLoading && explainableEvents.length === 0 ? (
            <StateNotice title="No Events Yet" message="Upload a clip or wait for AI analysis to find moments worth explaining." />
          ) : null}

          <EventTimeline
            events={explainableEvents}
            selectedEventId={selectedEventId}
            queuedEventIds={pendingOverlayEventIds}
            onSelect={handleSelectEvent}
          />
        </section>
      </main>
    </div>
  );
}
