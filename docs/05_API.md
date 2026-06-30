# MatchMind One API

## Endpoints

### `GET /health`

Returns service health and IBM adapter mode.

### `GET /api/matches`

Returns available seeded matches.

### `GET /api/matches/{match_id}`

Returns one match with summary metadata.

### `GET /api/matches/{match_id}/events`

Returns the ordered event timeline for a specific match.

### `GET /api/events/{event_id}`

Returns one event and its linked event-engine rule metadata.

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

### `GET /api/settings`

Returns defaults for placement, overlay timing, and accessibility options.
