# MatchMind One Product Specification

## Vision

Make football understandable for everyone without changing how people watch football.

## Product Philosophy

- Football comes first
- Explain only when necessary
- Personalize every explanation
- Show evidence and confidence
- Design for accessibility from the start

## Supported Viewer Profiles

- `new_fan`
- `casual_viewer`
- `analyst`
- `child`
- `accessibility`

## Core User Experience

The viewer watches a premium broadcast-style match experience. Important events can trigger a temporary overlay that includes:

- short headline
- concise explanation
- confidence label
- optional law reference
- auto-dismiss timing

## Functional Requirements

- Select and persist a viewer profile
- Load seeded match and event data
- Retrieve event-specific rule guidance
- Generate profile-aware explanations
- Render broadcast-safe overlays
- Support multiple explanations for the same event
- Expose settings for accessibility and pacing

## Non-Functional Requirements

- responsive on desktop and mobile
- clear separation of concerns
- environment-driven configuration
- accessible interaction patterns
- low-friction local development
