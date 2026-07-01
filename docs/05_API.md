# MatchMind One API

## Endpoints

### `GET /health`

Returns service health, IBM adapter mode, and active database backend.

### `GET /api/matches`

Returns available seeded matches.

### `GET /api/matches/{match_id}`

Returns one match with summary metadata.

### `GET /api/matches/{match_id}/events`

Returns the ordered event timeline for a specific match.

### `GET /api/events/{event_id}`

Returns one event and its linked event-engine rule metadata.

### `GET /api/demo-script`

Returns the curated judge/demo sequence used by demo mode.

### `GET /api/system/summary`

Returns demo-readiness metadata including seeded match counts, event counts, rule counts, supported profiles, supported event types, IBM mode, and database backend.

### `GET /api/videos`

Returns uploaded MP4 assets available to the local broadcast overlay studio.

### `POST /api/videos/upload`

Accepts multipart form data with a required `video` `.mp4` file and an optional `events` `.json` timeline file.

The optional timeline may be either a JSON array or an object with an `events` array. Each event should include `timestamp_seconds`, `type`, `title`, `team`, `opponent`, `summary`, `analysis`, `child_summary`, `confidence`, and optional `law_reference`.

### `POST /api/videos/{video_id}/analyze`

Creates a timed event timeline for the uploaded video. If a sidecar JSON timeline was uploaded, the API returns it. If no timeline exists, the current prototype creates a demo-calibrated event sequence so the overlay engine can be demonstrated on real footage.

### `GET /api/videos/{video_id}/events`

Returns the timed event timeline for an uploaded MP4. These events can be sent to `POST /api/explain` using their `event_id`.

### `POST /api/explain`

Request:

```json
{
  "profile": "new_fan",
  "event_id": "evt-penalty-62"
}
```

Response:

```json
{
  "event_id": "evt-penalty-62",
  "headline": "Penalty Awarded",
  "explanation": "The defender made contact before playing the ball, so the foul stopped the attacker unfairly.",
  "confidence": "high",
  "law_reference": "Law 12",
  "overlay": {
    "placement": "lower-right",
    "duration_seconds": 7
  }
}
```

### `POST /api/profile`

Stores the active local profile and presentation settings.

### `GET /api/profile`

Returns the active viewer profile and accessibility settings.

### `GET /api/settings`

Returns defaults for placement, overlay timing, and accessibility options.
