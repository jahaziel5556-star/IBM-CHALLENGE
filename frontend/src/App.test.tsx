import { render, screen } from "@testing-library/react";

import App from "./App";

vi.stubGlobal(
  "fetch",
  vi.fn((input: RequestInfo | URL) => {
    const url = String(input);

    if (url.endsWith("/api/matches")) {
      return Promise.resolve(
        new Response(
          JSON.stringify([
            {
              id: "match-world-final-001",
              competition: "World Championship Final",
              home_team: "Blue City",
              away_team: "Crimson United",
              venue: "Atlas Stadium",
              date: "2026-07-14",
              status: "in_progress",
              score: { home: 1, away: 1 },
            },
          ]),
        ),
      );
    }

    if (url.endsWith("/health")) {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            status: "ok",
            service: "matchmind-one-api",
            ibm_mode: "mock",
          }),
        ),
      );
    }

    if (url.endsWith("/api/profile")) {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            profile: "new_fan",
            language: "en",
            large_text: false,
            high_contrast: false,
            reduced_motion: false,
          }),
        ),
      );
    }

    if (url.endsWith("/api/demo-script")) {
      return Promise.resolve(
        new Response(
          JSON.stringify([
            {
              step: 1,
              event_id: "evt-offside-24",
              label: "Explain a confusing officiating moment",
              reason: "Shows law-based explanation for casual viewers immediately.",
            },
            {
              step: 2,
              event_id: "evt-penalty-62",
              label: "Compare profile-aware explanations",
              reason: "Best event for switching between viewer modes.",
            },
          ]),
        ),
      );
    }

    if (url.endsWith("/api/matches/match-world-final-001/events")) {
      return Promise.resolve(
        new Response(
          JSON.stringify([
            {
              id: "evt-highpress-12",
              minute: 12,
              title: "High Press Detected",
              summary: "Blue City are pressing the first pass aggressively.",
              team: "Blue City",
              opponent: "Crimson United",
              match_id: "match-world-final-001",
              type: "high_press_detected",
                rule: {
                  event_type: "high_press_detected",
                  prompt_template: "tactical_shift",
                  overlay_seconds: 6,
                  priority: 68,
                  retrieval_sources: ["tactical_knowledge", "match_context"],
                  trigger_summary: "Explain coordinated pressing traps that visibly change buildup quality.",
                  silence_summary: "Stay silent for isolated pressure moments.",
              },
            },
            {
              id: "evt-offside-24",
              minute: 24,
              title: "Goal Disallowed For Offside",
              summary: "The attacker moved beyond the line too early.",
              team: "Crimson United",
              opponent: "Blue City",
              match_id: "match-world-final-001",
              type: "offside",
                rule: {
                  event_type: "offside",
                  prompt_template: "law_interpretation",
                  overlay_seconds: 7,
                  priority: 88,
                  retrieval_sources: ["fifa_laws", "match_context"],
                  trigger_summary: "Explain close or confusing offsides.",
                  silence_summary: "Stay silent for obvious routine offsides away from danger.",
              },
            },
            {
              id: "evt-penalty-62",
              minute: 62,
              title: "Penalty Awarded",
              summary: "The defender made contact before winning the ball.",
              team: "Blue City",
              opponent: "Crimson United",
              match_id: "match-world-final-001",
              type: "penalty",
                rule: {
                  event_type: "penalty",
                  prompt_template: "officiating_decision",
                  overlay_seconds: 7,
                  priority: 95,
                  retrieval_sources: ["fifa_laws", "referee_guidance", "match_context"],
                  trigger_summary: "Explain after the decision or replay confirms contact.",
                  silence_summary: "Stay silent when contact is too uncertain to ground confidently.",
              },
            },
            {
              id: "evt-goal-81",
              minute: 81,
              title: "Crimson United Equalize",
              summary: "Crimson United's wide overload created a late cutback and a first-time equalizer.",
              team: "Crimson United",
              opponent: "Blue City",
              match_id: "match-world-final-001",
              type: "goal",
              rule: {
                event_type: "goal",
                prompt_template: "momentum_analysis",
                overlay_seconds: 6,
                priority: 90,
                retrieval_sources: ["match_context", "tactical_knowledge"],
                trigger_summary: "Explain goals only when buildup or controversy adds real understanding.",
                silence_summary: "Stay silent for routine finishes that viewers already understand.",
              },
            },
          ]),
        ),
      );
    }

    const eventsByPath: Record<string, object> = {
      "/api/events/evt-highpress-12": {
        id: "evt-highpress-12",
        minute: 12,
        title: "High Press Detected",
        summary: "Blue City are pressing the first pass aggressively.",
        team: "Blue City",
        opponent: "Crimson United",
        match_id: "match-world-final-001",
        type: "high_press_detected",
        rule: {
          event_type: "high_press_detected",
          prompt_template: "tactical_shift",
          overlay_seconds: 6,
          priority: 68,
          retrieval_sources: ["tactical_knowledge", "match_context"],
          trigger_summary: "Explain coordinated pressing traps that visibly change buildup quality.",
          silence_summary: "Stay silent for isolated pressure moments.",
        },
      },
      "/api/events/evt-offside-24": {
        id: "evt-offside-24",
        minute: 24,
        title: "Goal Disallowed For Offside",
        summary: "The attacker moved beyond the line too early.",
        team: "Crimson United",
        opponent: "Blue City",
        match_id: "match-world-final-001",
        type: "offside",
        rule: {
          event_type: "offside",
          prompt_template: "law_interpretation",
          overlay_seconds: 7,
          priority: 88,
          retrieval_sources: ["fifa_laws", "match_context"],
          trigger_summary: "Explain close or confusing offsides.",
          silence_summary: "Stay silent for obvious routine offsides away from danger.",
        },
      },
      "/api/events/evt-penalty-62": {
        id: "evt-penalty-62",
        minute: 62,
        title: "Penalty Awarded",
        summary: "The defender made contact before winning the ball.",
        team: "Blue City",
        opponent: "Crimson United",
        match_id: "match-world-final-001",
        type: "penalty",
        rule: {
          event_type: "penalty",
          prompt_template: "officiating_decision",
          overlay_seconds: 7,
          priority: 95,
          retrieval_sources: ["fifa_laws", "referee_guidance", "match_context"],
          trigger_summary: "Explain after the decision or replay confirms contact.",
          silence_summary: "Stay silent when contact is too uncertain to ground confidently.",
        },
      },
      "/api/events/evt-momentum-70": {
        id: "evt-momentum-70",
        minute: 70,
        title: "Momentum Shift",
        summary: "Crimson United are pinning Blue City deeper.",
        team: "Crimson United",
        opponent: "Blue City",
        match_id: "match-world-final-001",
        type: "momentum_shift",
        rule: {
          event_type: "momentum_shift",
          prompt_template: "momentum_analysis",
          overlay_seconds: 6,
          priority: 75,
          retrieval_sources: ["match_context", "tactical_knowledge"],
          trigger_summary: "Explain sustained swings in pressure, field tilt, or duel control.",
          silence_summary: "Stay silent for brief emotional swings with no tactical follow-through.",
        },
      },
      "/api/events/evt-sub-78": {
        id: "evt-sub-78",
        minute: 78,
        title: "Tactical Substitution",
        summary: "A fresh winger has been introduced.",
        team: "Crimson United",
        opponent: "Blue City",
        match_id: "match-world-final-001",
        type: "substitution",
        rule: {
          event_type: "substitution",
          prompt_template: "substitution_impact",
          overlay_seconds: 6,
          priority: 64,
          retrieval_sources: ["match_context", "tactical_knowledge", "profile_context"],
          trigger_summary: "Explain substitutions that change shape, pressure, or attacking intent.",
          silence_summary: "Stay silent for routine time-management substitutions.",
        },
      },
    };

    const matchedEntry = Object.entries(eventsByPath).find(([path]) => url.endsWith(path));
    if (matchedEntry) {
      return Promise.resolve(new Response(JSON.stringify(matchedEntry[1])));
    }

    if (url.endsWith("/api/explain")) {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            event_id: "evt-penalty-62",
            headline: "Penalty Awarded",
            explanation: "Blue City forced a foul inside the box.",
            confidence: "high",
            law_reference: "Law 12",
            prompt_template: "officiating_decision",
            silent_recommended: false,
            why_now: "Explain after the decision or replay confirms the contact.",
            silence_rule: "Stay silent when the contact remains too uncertain.",
            retrieval_sources: ["fifa_laws", "match_context"],
            evidence: ["62' minute context", "The defender made contact before winning the ball.", "Law 12"],
            overlay: {
              placement: "lower-right",
              duration_seconds: 7,
            },
          }),
        ),
      );
    }

    return Promise.resolve(new Response(JSON.stringify({ status: "ok" })));
  }),
);

describe("App", () => {
  it("renders the main broadcast framing", async () => {
    render(<App />);
    expect(await screen.findByText(/Explain the match/i)).toBeInTheDocument();
    expect(screen.getByText(/Live Event Engine/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start Auto-Run/i })).toBeInTheDocument();
    expect(screen.getByText(/Judge Demo Flow/i)).toBeInTheDocument();
    expect(screen.getByText(/Service Ready/i)).toBeInTheDocument();
    expect(screen.getByText(/Insight History/i)).toBeInTheDocument();
  });
});
