import { render, screen } from "@testing-library/react";

import { MatchStage } from "./MatchStage";
import type { ExplainResponse, MatchEvent, MatchSummary } from "../types/domain";

const match: MatchSummary = {
  id: "match-1",
  competition: "World Championship Final",
  home_team: "Blue City",
  away_team: "Crimson United",
  venue: "Atlas Stadium",
  date: "2026-07-14",
  status: "in_progress",
  score: { home: 1, away: 1 },
};

const pendingEvent: MatchEvent = {
  id: "evt-penalty-62",
  match_id: "match-1",
  timestamp_seconds: 62,
  minute: 62,
  type: "penalty",
  title: "Penalty Awarded",
  team: "Blue City",
  opponent: "Crimson United",
  summary: "The defender clipped the attacker before winning the ball.",
  rule: {
    event_type: "penalty",
    prompt_template: "officiating_decision",
    overlay_seconds: 7,
    priority: 95,
    retrieval_sources: ["fifa_laws", "match_context"],
    trigger_summary: "Explain after the referee confirms the foul.",
    silence_summary: "Stay silent when the contact cannot be grounded clearly.",
  },
};

const transientInsight: ExplainResponse = {
  event_id: "evt-penalty-62",
  headline: "Why the penalty stands",
  explanation: "The defender makes contact with the attacker before touching the ball, so the foul happens first.",
  confidence: "high",
  law_reference: "Law 12",
  prompt_template: "officiating_decision",
  silent_recommended: false,
  why_now: "This is a high-confusion officiating decision.",
  silence_rule: "Stay silent for obvious routine play.",
  retrieval_sources: ["fifa_laws", "match_context"],
  evidence: ["Contact arrives before the challenge reaches the ball."],
  decision: {
    should_speak: true,
    priority: 95,
    priority_label: "high",
    confidence: "high",
    reason: "The referee decision needs clarification.",
    timing: "immediate",
  },
  overlay: {
    placement: "lower_left",
    duration_seconds: 7,
  },
};

beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, "play", {
    configurable: true,
    writable: true,
    value: vi.fn(() => Promise.resolve()),
  });
  Object.defineProperty(HTMLMediaElement.prototype, "pause", {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });
});

describe("MatchStage", () => {
  it("renders a pending overlay immediately for uncached explainable incidents", () => {
    render(
      <MatchStage
        match={match}
        liveScore={{ home: 1, away: 1 }}
        videoUrl="https://example.com/demo.mp4"
        videoCurrentTime={62}
        videoDuration={120}
        isVideoPlaying
        transientInsight={null}
        transientPendingEvent={pendingEvent}
        onTogglePlayback={() => undefined}
        onVideoSeek={() => undefined}
        onSkipBy={() => undefined}
      />,
    );

    expect(screen.getByText("Reading the moment")).toBeInTheDocument();
    expect(screen.getByText("Penalty Awarded")).toBeInTheDocument();
    expect(screen.getByText("AI is preparing the explanation for this incident.")).toBeInTheDocument();
  });

  it("renders the compact overlay copy when an explanation is ready", () => {
    render(
      <MatchStage
        match={match}
        liveScore={{ home: 1, away: 1 }}
        videoUrl="https://example.com/demo.mp4"
        videoCurrentTime={62}
        videoDuration={120}
        isVideoPlaying
        transientInsight={transientInsight}
        transientPendingEvent={null}
        onTogglePlayback={() => undefined}
        onVideoSeek={() => undefined}
        onSkipBy={() => undefined}
      />,
    );

    expect(screen.getByText("AI overlay")).toBeInTheDocument();
    expect(screen.getByText("Why the penalty stands")).toBeInTheDocument();
    expect(screen.getByText("Law 12")).toBeInTheDocument();
  });
});
