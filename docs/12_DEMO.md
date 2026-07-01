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
- The Event Engine decides whether to speak before IBM Granite writes the explanation.
- The same event changes by viewer profile.
- Explanations are grounded in rule context, not free-form commentary.
- The compact overlay keeps evidence and rule detail out of the main video area.
- The system is designed for IBM watsonx.ai with a safe mock fallback for local demos.

## Demo Runtime

- Rapid submission verification: `.\scripts\verify-release-readiness.ps1`
- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && .venv\Scripts\activate && uvicorn app.main:app --reload`
- Browser validation: `cd frontend && npm run test:e2e`
- MP4 overlay demo: upload a `.mp4` in the Video Overlay Studio, optionally with `assets/sample-video-events.json` as the event timeline
- Live watsonx validation: `.\scripts\verify-watsonx-live.ps1`
- CI validation: GitHub Actions runs the same demo-flow verification on pushes and pull requests
- Demo bundle packaging: `.\scripts\package-demo-bundle.ps1`

## Demo Success Criteria

- Auto/demo mode sequences cleanly.
- Overlay timing looks broadcast-safe.
- Profile switching visibly changes explanation style.
- Replay window and evidence improve trust.
- The E2E demo-flow test passes against the local stack.
- A shareable demo bundle can be generated from the current commit.
- The full non-Docker release-readiness script passes on the local machine.
- An uploaded MP4 can render timed AI insight overlays from a sidecar timeline or demo-calibrated analysis.
