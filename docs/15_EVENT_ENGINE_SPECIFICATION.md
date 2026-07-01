# MatchMind One Event Engine Specification

Version: 1.1

Status: Engineering Specification

## Purpose

The Event Engine determines if, when, and how MatchMind One should request an AI insight. It sits between the match feed, uploaded video timeline, or future live data provider and the IBM Granite reasoning layer.

The Event Engine does not generate explanations. It decides whether an explanation would improve viewer understanding. If no value is added, no overlay should appear.

## Philosophy

Football is the primary experience. AI exists only to improve understanding, and good AI knows when to stay quiet.

## Responsibilities

- Detect or receive significant football events
- Classify events against the supported event catalog
- Evaluate viewer benefit by profile
- Determine priority, confidence, and timing
- Delay insights when live action would be interrupted
- Queue simultaneous events
- Trigger IBM Granite only when required
- Validate that the final overlay is concise, grounded, and broadcast-safe

## Event Lifecycle

1. Match event is detected from seeded data, uploaded timeline JSON, or future live feed
2. Event is classified into the event catalog
3. Priority is evaluated
4. Viewer profile is evaluated
5. Trusted knowledge is retrieved
6. IBM Granite receives the prompt only if an insight is warranted
7. Response is validated
8. Overlay payload is generated
9. Overlay dismisses automatically

## Priority Levels

- `low`: routine events such as throw-ins, goal kicks, simple passes, routine corners, and routine free kicks. No overlay.
- `medium`: situational events such as normal substitutions, formation adjustments, possession shifts, and counterattacks. Explain mainly for beginner-oriented profiles.
- `high`: confusing events such as VAR reviews, penalty decisions, red cards, offside goals, major tactical changes, and momentum swings. Explain for most profiles.
- `critical`: match-defining events such as disallowed goals, penalty shootout moments, match-winning goals, last-minute VAR, and serious injury stoppages. Explain for every profile once grounded.

## Broadcast Timing

Never display an insight immediately after kickoff, during active attacking play, while the ball is inside the penalty area, while another overlay is visible, or while the event is still too uncertain to ground.

Prefer timing immediately after replay, during stoppages, after commentator emphasis, during VAR review, during substitutions, and during injury stoppages.

## Overlay Duration

- `low`: no overlay
- `medium`: 5 seconds
- `high`: 6 seconds
- `critical`: 8 seconds
- `maximum`: 10 seconds

## Prompt Templates

- `officiating_decision`
- `law_interpretation`
- `tactical_shift`
- `momentum_analysis`
- `player_welfare`
- `substitution_impact`

## Retrieval Sources

- `fifa_laws`
- `referee_guidance`
- `tactical_knowledge`
- `match_context`
- `profile_context`

## Event Catalog

### Goal

- Trigger when goal is confirmed and the buildup, controversy, own goal context, milestone, or tactical pattern adds understanding
- Stay silent for routine finishes with obvious context
- Prompt template: `momentum_analysis`
- Retrieval: `match_context`, `tactical_knowledge`
- Default overlay: 6 seconds

### Goal Disallowed

- Trigger once the official reason is clear
- Always explain because this is one of football's most confusing moments
- Include reason, law reference when available, confidence, and simple wording
- Prompt template: `law_interpretation`
- Retrieval: `fifa_laws`, `referee_guidance`, `match_context`
- Default overlay: 8 seconds

### VAR Review

- Trigger after replay or official review context is visible
- Explain what officials are reviewing, but do not predict the final decision
- Stay silent while the referee is still actively reviewing unless the UI is marking a pending review state
- Prompt template: `law_interpretation`
- Retrieval: `fifa_laws`, `referee_guidance`, `match_context`
- Default overlay: 8 seconds

### Offside

- Trigger on disallowed goal, marginal offside, delayed flag, VAR offside, or viewer-confusing stoppage
- Stay silent for clearly routine offsides far from goal
- Prompt template: `law_interpretation`
- Retrieval: `fifa_laws`, `match_context`
- Default overlay: 7 seconds

### Penalty

- Trigger after the decision or decisive replay
- Include contact, handball context when relevant, law, and confidence
- Stay silent if the incident is too uncertain and no trustworthy grounding exists
- Prompt template: `officiating_decision`
- Retrieval: `fifa_laws`, `referee_guidance`, `match_context`
- Default overlay: 7 seconds

### No Penalty

- Trigger after a clear appeal or collision where viewers may expect a penalty
- Explain why play continued without treating every collision as a foul
- Stay silent for routine, speculative, or unsupported incidents
- Prompt template: `officiating_decision`
- Retrieval: `fifa_laws`, `referee_guidance`, `match_context`
- Default overlay: 6 seconds

### Red Card

- Trigger after dismissal or decisive replay
- Include reason, applicable law, severity, and match impact
- Stay silent during uncertainty before the card is shown
- Prompt template: `officiating_decision`
- Retrieval: `fifa_laws`, `referee_guidance`, `match_context`
- Default overlay: 8 seconds

### Yellow Card

- Trigger for tactical fouls, persistent infringement, dissent, or confusing cautions
- Stay silent for routine cautions with obvious context
- Prompt template: `officiating_decision`
- Retrieval: `fifa_laws`, `match_context`
- Default overlay: 6 seconds

### Substitution

- Trigger when the change is tactical, protective, or momentum-related
- Stay silent for routine time-management changes unless they affect shape or pressure
- Prompt template: `substitution_impact`
- Retrieval: `match_context`, `tactical_knowledge`, `profile_context`
- Default overlay: 6 seconds

### Tactical Formation Change

- Trigger when formation, pressing intensity, defensive shape, width, or control materially changes
- Explain what changed, why it matters, and likely impact
- Stay silent if the shape change is subtle and not affecting play
- Prompt template: `tactical_shift`
- Retrieval: `tactical_knowledge`, `match_context`
- Default overlay: 7 seconds

### Momentum Shift

- Trigger when possession pressure, field tilt, chance quality, or duel control clearly changes
- Never simply state that momentum changed; explain what caused it
- Stay silent for short-lived swings without sustained effect
- Prompt template: `momentum_analysis`
- Retrieval: `match_context`, `tactical_knowledge`
- Default overlay: 6 seconds

### High Press Detected

- Trigger when repeated coordinated pressing traps force rushed buildup
- Prioritize `new_fan`, `casual_viewer`, and `child` profiles
- Stay silent for isolated pressure moments
- Prompt template: `tactical_shift`
- Retrieval: `tactical_knowledge`, `match_context`
- Default overlay: 6 seconds

### Defensive Block Change

- Trigger when the defending team visibly changes line height or compactness and it affects progression
- Stay silent if the block remains functionally unchanged
- Prompt template: `tactical_shift`
- Retrieval: `tactical_knowledge`, `match_context`
- Default overlay: 6 seconds

### Low Block

- Trigger when a low defensive strategy clearly changes space, tempo, or attacking options
- Explain the defensive reason and expected outcome
- Stay silent when retreating is routine and has no clear structural effect
- Prompt template: `tactical_shift`
- Retrieval: `tactical_knowledge`, `match_context`
- Default overlay: 6 seconds

### Counterattack

- Trigger when a transition exploits imbalance or creates a dangerous attack
- Stay silent for harmless direct breaks
- Prompt template: `momentum_analysis`
- Retrieval: `match_context`, `tactical_knowledge`
- Default overlay: 5 seconds

### Dangerous Attack

- Trigger when a sequence creates repeated pressure or a near-goal chance that viewers may not fully decode
- Stay silent for standard entries with no notable tactical cause
- Prompt template: `momentum_analysis`
- Retrieval: `match_context`, `tactical_knowledge`
- Default overlay: 5 seconds

### Injury

- Trigger when stoppage affects tempo, shape, procedure, or player availability
- Never speculate about player health
- Stay silent for brief treatment with no strategic or procedural impact
- Prompt template: `player_welfare`
- Retrieval: `match_context`
- Default overlay: 5 seconds

## Viewer Profile Adaptation

- `new_fan`: very simple vocabulary, short sentences, no jargon
- `casual_viewer`: moderate detail, simple football terms, minimal tactics
- `analyst`: technical language, formation names, pressing triggers, defensive shape, and statistical reasoning
- `child`: friendly language, simple examples, positive tone
- `accessibility`: simplified reading level, stable pacing, larger text, high contrast, reduced motion, and future voice narration

## Output Contract

Every explanation returns headline, explanation, evidence, confidence, applicable law when grounded, overlay duration, prompt template, retrieval sources, and silence rule.

Maximum explanation length is two sentences and approximately 60 words.

## Quality Rules

- Be truthful
- Be explainable
- Be concise
- Be relevant
- Be grounded
- Stay human-centered
- Never fabricate Laws of the Game
- Never exaggerate certainty
- Never interrupt important live play

## Acceptance Criteria

- AI only speaks when valuable
- Overlays never distract from the main broadcast
- Explanations improve understanding
- Viewer profiles produce different outputs
- Broadcast remains the primary experience
- Every explanation is traceable to rules and evidence
- Confidence is displayed when appropriate

## Future Expansion

The engine should remain sport-adaptable so basketball, rugby, cricket, Formula 1, tennis, and Olympic event catalogs can reuse the same explainable AI architecture with sport-specific rules.
