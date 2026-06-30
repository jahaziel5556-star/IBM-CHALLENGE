# MatchMind One Demo Guide

## Objective

Show that MatchMind One improves understanding without interrupting the live football experience.

## Recommended Demo Flow

1. Start `Demo Mode` in the frontend.
2. Let the system walk through the curated sequence:
   - offside confusion
   - penalty explanation
   - VAR confirmation
   - tactical equalizer
   - late red card
3. Switch between `new_fan`, `analyst`, and `accessibility` during the penalty or VAR step.
4. Point to:
   - replay window
   - evidence chips
   - service status
   - overlay queue behavior

## Key Talking Points

- The AI stays quiet unless the event has explanatory value.
- The same event changes by viewer profile.
- Explanations are grounded in rule context, not free-form commentary.
- The system is designed for IBM watsonx.ai with a safe mock fallback for local demos.

## Demo Runtime

- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && .venv\Scripts\activate && uvicorn app.main:app --reload`
- Browser validation: `cd frontend && npm run test:e2e`

## Demo Success Criteria

- Auto/demo mode sequences cleanly.
- Overlay timing looks broadcast-safe.
- Profile switching visibly changes explanation style.
- Replay window and evidence improve trust.
- The E2E demo-flow test passes against the local stack.
