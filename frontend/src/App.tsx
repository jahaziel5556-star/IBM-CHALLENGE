import { useEffect, useState } from "react";

import { apiGet, apiPost } from "./api/client";
import { EventTimeline } from "./components/EventTimeline";
import { HeaderBar } from "./components/HeaderBar";
import { InsightOverlay } from "./components/InsightOverlay";
import { MatchStage } from "./components/MatchStage";
import { ProfileSwitcher } from "./components/ProfileSwitcher";
import { SettingsPanel } from "./components/SettingsPanel";
import type { ExplainResponse, MatchEvent, MatchSummary, ProfileId, ProfileSettings } from "./types/domain";

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

  useEffect(() => {
    void apiGet<MatchSummary[]>("/api/matches").then((loadedMatches) => {
      setMatches(loadedMatches);
      const primaryMatch = loadedMatches[0];
      if (primaryMatch) {
        void apiGet<MatchEvent[]>(`/api/matches/${primaryMatch.id}/events`).then(setEvents);
      }
    });
    void apiGet<ProfileSettings>("/api/profile").then((loadedProfile) => {
      setProfile(loadedProfile.profile);
      setProfileSettings(loadedProfile);
    });
  }, []);

  useEffect(() => {
    if (!activeInsight) {
      return;
    }

    const timeout = window.setTimeout(() => setActiveInsight(null), activeInsight.overlay.duration_seconds * 1000);
    return () => window.clearTimeout(timeout);
  }, [activeInsight]);

  async function handleExplain(eventId: string) {
    setSelectedEventId(eventId);
    const insight = await apiPost<ExplainResponse>("/api/explain", { profile, event_id: eventId });
    setActiveInsight(insight);
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

      <HeaderBar />
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
            <button className="primary-button" onClick={() => void handleExplain(selectedEventId)}>
              Generate Insight
            </button>
          </div>
        </section>

        <section className="broadcast-panel">
          <MatchStage match={matches[0]} />
          <InsightOverlay insight={activeInsight} />
        </section>

        <section className="sidebar-panel">
          <h2>Live Event Engine</h2>
          <p className="sidebar-copy">
            Each event follows the official rulebook in the event engine spec, including timing, silence, confidence,
            and prompt-template mapping.
          </p>
          <EventTimeline events={events} selectedEventId={selectedEventId} onExplain={handleExplain} />
        </section>
      </main>
    </div>
  );
}
