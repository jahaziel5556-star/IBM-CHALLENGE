export type ProfileId = "new_fan" | "casual_viewer" | "analyst" | "child" | "accessibility";

export type MatchSummary = {
  id: string;
  competition: string;
  home_team: string;
  away_team: string;
  venue: string;
  date: string;
  status: string;
  score: {
    home: number;
    away: number;
  };
};

export type MatchEvent = {
  id: string;
  match_id: string;
  minute: number;
  type: string;
  title: string;
  team: string;
  opponent: string;
  summary: string;
  confidence?: string;
  law_reference?: string;
  rule: {
    event_type: string;
    prompt_template: string;
    overlay_seconds: number;
  };
};

export type ExplainResponse = {
  event_id: string;
  headline: string;
  explanation: string;
  confidence: string;
  law_reference: string | null;
  prompt_template: string;
  silent_recommended: boolean;
  overlay: {
    placement: string;
    duration_seconds: number;
  };
};
