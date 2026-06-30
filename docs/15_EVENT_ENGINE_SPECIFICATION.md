# MatchMind One Event Engine Specification

## Purpose

This document is the rulebook for when MatchMind One should speak, what it should say, who it should speak to, and how long the overlay should remain visible.

## Global Principles

- Stay silent for routine events with low explanatory value
- Prefer post-replay timing for officiating decisions
- Never fabricate laws, certainty, or hidden evidence
- Keep `child` explanations friendly and concrete
- Keep `analyst` explanations tactically richer and more precise
- Use lower-right placement by default unless accessibility settings override it

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

## Event Rules

### Goal

- Trigger insight when the goal follows a notable tactical pattern, controversial buildup, or immediate question viewers are likely to ask
- Stay silent for routine finishes with obvious context
- Profiles:
  - `new_fan`, `casual_viewer`, `child`: explain why the attack worked
  - `analyst`: explain buildup pattern, space creation, and defensive failure
  - `accessibility`: simplified wording with stable pacing
- Prompt template: `momentum_analysis`
- Retrieval: `match_context`, `tactical_knowledge`
- Overlay: 6 seconds

### VAR Review

- Trigger after replay or official review announcement
- Stay silent while the referee is still actively reviewing unless the UI is marking a pending review state
- Profiles receive increasing depth from simple review explanation to law-based interpretation
- Prompt template: `law_interpretation`
- Retrieval: `fifa_laws`, `referee_guidance`, `match_context`
- Overlay: 8 seconds

### Offside

- Trigger on disallowed goal, close attacking move, or viewer-confusing stoppage
- Stay silent for clearly routine offsides far from goal
- Prompt template: `law_interpretation`
- Retrieval: `fifa_laws`, `match_context`
- Overlay: 7 seconds

### Penalty

- Trigger after the decision or decisive replay
- Stay silent if the incident is too uncertain and no trustworthy grounding exists
- Prompt template: `officiating_decision`
- Retrieval: `fifa_laws`, `referee_guidance`, `match_context`
- Overlay: 7 seconds

### Red Card

- Trigger after dismissal or decisive replay
- Stay silent during uncertainty before the card is shown
- Prompt template: `officiating_decision`
- Retrieval: `fifa_laws`, `referee_guidance`, `match_context`
- Overlay: 8 seconds

### Yellow Card

- Trigger for tactical fouls, persistent infringement, or confusing cautions
- Stay silent for routine cautions with obvious context
- Prompt template: `officiating_decision`
- Retrieval: `fifa_laws`, `match_context`
- Overlay: 6 seconds

### Tactical Formation Change

- Trigger when a formation switch materially changes pressure, width, or control
- Stay silent if the shape change is subtle and not affecting play
- Prompt template: `tactical_shift`
- Retrieval: `tactical_knowledge`, `match_context`
- Overlay: 7 seconds

### Momentum Shift

- Trigger when possession pressure, field tilt, or chance quality clearly changes
- Stay silent for short-lived swings without sustained effect
- Prompt template: `momentum_analysis`
- Retrieval: `match_context`, `tactical_knowledge`
- Overlay: 6 seconds

### High Press Detected

- Trigger when repeated coordinated pressing traps force rushed buildup
- Stay silent for isolated presses
- Prompt template: `tactical_shift`
- Retrieval: `tactical_knowledge`, `match_context`
- Overlay: 6 seconds

### Defensive Block Change

- Trigger when the defending team visibly changes line height or compactness and it affects progression
- Stay silent if the block remains functionally unchanged
- Prompt template: `tactical_shift`
- Retrieval: `tactical_knowledge`, `match_context`
- Overlay: 6 seconds

### Counterattack

- Trigger when a transition clearly exploits imbalance or creates a dangerous attack
- Stay silent for harmless direct breaks
- Prompt template: `momentum_analysis`
- Retrieval: `match_context`, `tactical_knowledge`
- Overlay: 5 seconds

### Dangerous Attack

- Trigger when a sequence creates repeated pressure or a near-goal chance that viewers may not fully decode
- Stay silent for standard entries with no notable tactical cause
- Prompt template: `momentum_analysis`
- Retrieval: `match_context`, `tactical_knowledge`
- Overlay: 5 seconds

### Injury

- Trigger when the stoppage meaningfully affects player availability or tempo
- Stay silent for very brief treatment with no strategic impact
- Prompt template: `player_welfare`
- Retrieval: `match_context`
- Overlay: 5 seconds

### Substitution

- Trigger when the change is tactical, protective, or momentum-related
- Stay silent for routine late-game time management unless it changes shape or pressure
- Prompt template: `substitution_impact`
- Retrieval: `match_context`, `tactical_knowledge`, `profile_context`
- Overlay: 6 seconds

## Confidence Rules

- `high`: rule and match context strongly align
- `medium`: likely explanation with some ambiguity
- `low`: insight may help but must explicitly acknowledge uncertainty

## Silence Rules

The engine must stay silent when:

- the event is routine and self-explanatory
- no trusted grounding is available
- the insight would overlap the most intense live action
- an explanation would repeat recent content without adding value
