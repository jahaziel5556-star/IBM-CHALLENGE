import { useEffect, useState } from "react";

import { apiGet, apiPost } from "./api/client";
import { BroadcastControls } from "./components/BroadcastControls";
import { DemoGuide } from "./components/DemoGuide";
import { EventTimeline } from "./components/EventTimeline";
import { HeaderBar } from "./components/HeaderBar";
import { InsightHistory } from "./components/InsightHistory";
import { InsightOverlay } from "./components/InsightOverlay";
import { MatchStage } from "./components/MatchStage";
import { ProfileSwitcher } from "./components/ProfileSwitcher";
import { ReplaySpotlight } from "./components/ReplaySpotlight";
import { SettingsPanel } from "./components/SettingsPanel";
import { StateNotice } from "./components/StateNotice";
import type {
  DemoScriptStep,
  ExplainResponse,
  HealthResponse,
  MatchEvent,
  MatchSummary,
  ProfileId,
  ProfileSettings,
} from "./types/domain";

const profiles: ProfileId[] = ["new_fan", "casual_viewer", "analyst", "child", "accessibility"];

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
  const [queuedEventIds, setQueuedEventIds] = useState<string[]>([]);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [processedEventIds, setProcessedEventIds] = useState<string[]>([]);
  const [lastExplainedMinute, setLastExplainedMinute] = useState<number | null>(null);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [health, setHealth] = useState<HealthResponse>({
    status: "unknown",
    service: "matchmind-one-api",
    ibm_mode: "mock",
    database_backend: "sqlite",
  });
  const [demoScript, setDemoScript] = useState<DemoScriptStep[]>([]);
  const [insightHistory, setInsightHistory] = useState<
    Array<{
      eventId: string;
      profile: ProfileId;
      insight: ExplainResponse;
      minute: number;
      title: string;
    }>
  >([]);

  useEffect(() => {
    async function loadApp() {
      try {
        setIsLoading(true);
        const [healthResponse, loadedMatches, loadedProfile, loadedDemoScript] = await Promise.all([
          apiGet<HealthResponse>("/health"),
          apiGet<MatchSummary[]>("/api/matches"),
          apiGet<ProfileSettings>("/api/profile"),
          apiGet<DemoScriptStep[]>("/api/demo-script"),
        ]);
        setHealth(healthResponse);
        setMatches(loadedMatches);
        setProfile(loadedProfile.profile);
        setProfileSettings(loadedProfile);
        setDemoScript(loadedDemoScript);

        const primaryMatch = loadedMatches[0];
        if (primaryMatch) {
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
    if (!activeInsight) {
      return;
    }

    const timeout = window.setTimeout(() => setActiveInsight(null), activeInsight.overlay.duration_seconds * 1000);
    return () => window.clearTimeout(timeout);
  }, [activeInsight]);

  useEffect(() => {
    if (!isAutoRunning || events.length === 0) {
      return;
    }

    let cancelled = false;
    const delay = profileSettings.reduced_motion ? 2600 : 1800;
    const sequenceSource = isDemoRunning ? demoScript.map((item) => item.event_id) : events.map((event) => event.id);
    const remainingEvents = sequenceSource
      .map((eventId) => events.find((event) => event.id === eventId))
      .filter((event): event is MatchEvent => Boolean(event))
      .filter((event) => !processedEventIds.includes(event.id))
      .sort((left, right) => left.minute - right.minute);

    async function runSequence() {
      for (const event of remainingEvents) {
        if (cancelled) {
          return;
        }
        const shouldQueue =
          lastExplainedMinute === null ||
          event.minute - lastExplainedMinute >= 6 ||
          event.rule.priority >= 90;

        if (!shouldQueue) {
          continue;
        }

        setQueuedEventIds((current) => [...current, event.id]);
        await handleExplain(event.id, { fromAutoRun: true });
        if (cancelled) {
          return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, delay));
      }
      setIsAutoRunning(false);
      setIsDemoRunning(false);
    }

    void runSequence();

    return () => {
      cancelled = true;
    };
  }, [isAutoRunning, events, isDemoRunning, lastExplainedMinute, processedEventIds, profileSettings.reduced_motion, demoScript]);

  async function handleExplain(eventId: string, options?: { fromAutoRun?: boolean }) {
    setSelectedEventId(eventId);
    try {
      const insight = await apiPost<ExplainResponse>("/api/explain", { profile, event_id: eventId });
      setQueuedEventIds((current) => current.filter((queuedId) => queuedId !== eventId));
      const event = events.find((item) => item.id === eventId);
      if (event) {
        setLastExplainedMinute(event.minute);
        setInsightHistory((current) => [
          {
            eventId,
            profile,
            insight,
            minute: event.minute,
            title: event.title,
          },
          ...current.filter((entry) => !(entry.eventId === eventId && entry.profile === profile)),
        ]);
      }
      if (options?.fromAutoRun) {
        setProcessedEventIds((current) => [...new Set([...current, eventId])]);
      }
      setActiveInsight(insight);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Insight generation failed.");
      setIsAutoRunning(false);
      setIsDemoRunning(false);
    }
  }

  async function handleProfileChange(nextProfile: ProfileId) {
    setProfile(nextProfile);
    const nextSettings = { ...profileSettings, profile: nextProfile };
    setProfileSettings(nextSettings);
    await apiPost("/api/profile", nextSettings);
    if (selectedEventId) {
      void handleExplain(selectedEventId);
    }
  }

  async function handleToggleSetting(field: "large_text" | "high_contrast" | "reduced_motion", value: boolean) {
    const nextSettings = { ...profileSettings, profile, [field]: value };
    setProfileSettings(nextSettings);
    await apiPost("/api/profile", nextSettings);
  }

  function handleStartAutoRun() {
    setQueuedEventIds([]);
    setProcessedEventIds([]);
    setLastExplainedMinute(null);
    setInsightHistory([]);
    setIsDemoRunning(false);
    setIsAutoRunning(true);
  }

  function handleStartDemo() {
    setQueuedEventIds([]);
    setProcessedEventIds([]);
    setLastExplainedMinute(null);
    setInsightHistory([]);
    setIsDemoRunning(true);
    setIsAutoRunning(true);
  }

  function handleStopAutoRun() {
    setIsAutoRunning(false);
    setIsDemoRunning(false);
    setQueuedEventIds([]);
  }

  function handleJumpToDemoStep(eventId: string) {
    setIsAutoRunning(false);
    setIsDemoRunning(false);
    void handleExplain(eventId);
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
      <main className="page-grid">
        <section className="hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">AI Broadcast Intelligence Layer</p>
            <h1>Explain the match without interrupting the match.</h1>
            <p className="lede">
              MatchMind One adds timed, explainable football insights only when viewers need help understanding
              what just changed.
            </p>
          </div>

          <div className="controls-panel">
            <ProfileSwitcher profiles={profiles} activeProfile={profile} onChange={handleProfileChange} />
            <SettingsPanel settings={profileSettings} onToggle={handleToggleSetting} />
            <BroadcastControls
              isAutoRunning={isAutoRunning}
              isDemoRunning={isDemoRunning}
              queueLength={queuedEventIds.length}
              onStart={handleStartAutoRun}
              onStartDemo={handleStartDemo}
              onStop={handleStopAutoRun}
            />
            <DemoGuide
              currentMinute={liveMinute}
              currentScore={liveScore}
              isAutoRunning={isAutoRunning}
              demoScript={demoScript}
              activeEventId={selectedEventId}
              onJumpToStep={handleJumpToDemoStep}
            />
            <button className="primary-button" onClick={() => void handleExplain(selectedEventId)}>
              Generate Insight
            </button>
          </div>
        </section>

        <section className="broadcast-panel">
          {errorMessage ? (
            <StateNotice title="System Notice" message={errorMessage} tone="error" />
          ) : null}
          {isLoading ? (
            <StateNotice
              title="Loading Broadcast"
              message="Fetching match context, viewer profile, and event engine state."
            />
          ) : null}
          <MatchStage
            match={matches[0]}
            activeEvent={selectedEvent}
            queueLength={queuedEventIds.length}
            isAutoRunning={isAutoRunning}
            liveMinute={liveMinute}
            liveScore={liveScore}
          />
          <InsightOverlay insight={activeInsight} />
        </section>

        <section className="sidebar-panel">
          <h2>Live Event Engine</h2>
          <p className="sidebar-copy">
            Each event follows the official rulebook in the event engine spec, including timing, silence, confidence,
            and prompt-template mapping.
          </p>
          {!isLoading && events.length === 0 ? (
            <StateNotice title="No Events" message="No seeded events are available for the active match yet." />
          ) : null}
          <ReplaySpotlight event={selectedEvent} />
          <InsightHistory history={insightHistory} onSelect={(eventId) => void handleExplain(eventId)} />
          <EventTimeline
            events={events}
            selectedEventId={selectedEventId}
            queuedEventIds={queuedEventIds}
            onExplain={handleExplain}
          />
        </section>
      </main>
    </div>
  );
}
