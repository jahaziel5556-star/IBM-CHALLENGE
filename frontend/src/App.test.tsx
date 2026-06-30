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
              rule: { event_type: "high_press_detected", prompt_template: "tactical_shift", overlay_seconds: 6 },
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
              rule: { event_type: "offside", prompt_template: "law_interpretation", overlay_seconds: 7 },
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
              rule: { event_type: "penalty", prompt_template: "officiating_decision", overlay_seconds: 7 },
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
        rule: { event_type: "high_press_detected", prompt_template: "tactical_shift", overlay_seconds: 6 },
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
        rule: { event_type: "offside", prompt_template: "law_interpretation", overlay_seconds: 7 },
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
        rule: { event_type: "penalty", prompt_template: "officiating_decision", overlay_seconds: 7 },
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
        rule: { event_type: "momentum_shift", prompt_template: "momentum_analysis", overlay_seconds: 6 },
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
        rule: { event_type: "substitution", prompt_template: "substitution_impact", overlay_seconds: 6 },
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
  });
});
