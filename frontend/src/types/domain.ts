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

export type HealthResponse = {
  status: string;
  service: string;
  ibm_mode: string;
  database_backend: string;
};

export type DemoScriptStep = {
  step: number;
  event_id: string;
  label: string;
  reason: string;
};

export type SystemSummary = {
  database_backend: string;
  ibm_mode: string;
  match_count: number;
  event_count: number;
  rule_count: number;
  demo_step_count: number;
  profiles_supported: string[];
  event_types_supported: string[];
};

export type MatchEvent = {
  id: string;
  match_id: string;
  video_id?: string;
  timestamp_seconds?: number;
  minute: number;
  type: string;
  title: string;
  team: string;
  opponent: string;
  summary: string;
  confidence?: string;
  law_reference?: string;
  silent_recommended?: boolean;
  rule: {
    event_type: string;
    prompt_template: string;
    overlay_seconds: number;
    priority: number;
    retrieval_sources: string[];
    trigger_summary: string;
    silence_summary: string;
  };
};

export type VideoAsset = {
  id: string;
  filename: string;
  video_url: string;
  event_count: number;
  analysis_status: string;
  timeline_source: string;
  created_at: string;
};

export type VideoAnalysisResponse = {
  video: VideoAsset;
  events: MatchEvent[];
};

export type ProfileSettings = {
  profile: ProfileId;
  language: string;
  large_text: boolean;
  high_contrast: boolean;
  reduced_motion: boolean;
};

export type ExplainResponse = {
  event_id: string;
  headline: string;
  explanation: string;
  confidence: string;
  law_reference: string | null;
  prompt_template: string;
  silent_recommended: boolean;
  why_now: string;
  silence_rule: string;
  retrieval_sources: string[];
  evidence: string[];
  overlay: {
    placement: string;
    duration_seconds: number;
  };
};
