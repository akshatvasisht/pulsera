# Interface Documentation

## Protocol Types

Pulsera uses a combination of REST API (FastAPI), WebSocket events (real-time communication), and native SDKs for health data.

## REST API (FastAPI Backend)

Base URL: `http://localhost:8000` (development)

### Authentication

Currently using session-based authentication (stub implementation). Future versions will implement JWT bearer tokens.

```
Authorization: Bearer <token>
```

### Episodes

#### `POST /episodes/start`

**Description:** Start a new health episode when vitals anomaly is detected.

**Request Body:**

```json
{
  "user_id": "string",
  "episode_type": "heart_rate_spike",
  "initial_vitals": {
    "heart_rate": 145,
    "hrv": 25
  },
  "timestamp": "2026-02-10T13:00:00Z"
}
```

**Response:**

```json
{
  "episode_id": "uuid",
  "status": "active",
  "created_at": "2026-02-10T13:00:00Z"
}
```

#### `PUT /episodes/{episode_id}/resolve`

**Description:** Mark an episode as resolved after intervention completes.

**Request Body:**

```json
{
  "resolution_type": "calming_successful",
  "final_vitals": {
    "heart_rate": 85,
    "hrv": 55
  },
  "duration_seconds": 180
}
```

**Response:**

```json
{
  "episode_id": "uuid",
  "status": "resolved",
  "resolved_at": "2026-02-10T13:03:00Z"
}
```

#### `GET /episodes/user/{user_id}`

**Description:** Retrieve episode history for a user.

**Query Parameters:**

- `limit` (int, optional): Number of episodes to return (default: 20)
- `status` (string, optional): Filter by status (active, resolved, escalated)

**Response:**

```json
{
  "episodes": [
    {
      "episode_id": "uuid",
      "type": "heart_rate_spike",
      "status": "resolved",
      "created_at": "2026-02-10T13:00:00Z",
      "resolved_at": "2026-02-10T13:03:00Z"
    }
  ],
  "total": 42
}
```

### Groups

#### `POST /groups`

**Description:** Create a new family group.

**Request Body:**

```json
{
  "name": "Family Group",
  "admin_user_id": "uuid"
}
```

**Response:**

```json
{
  "group_id": "uuid",
  "name": "Family Group",
  "created_at": "2026-02-10T13:00:00Z"
}
```

#### `POST /groups/{group_id}/members`

**Description:** Add a member to a group.

**Request Body:**

```json
{
  "user_id": "uuid",
  "role": "member"
}
```

#### `GET /groups/{group_id}`

**Description:** Get group details including members.

**Response:**

```json
{
  "group_id": "uuid",
  "name": "Family Group",
  "members": [
    {
      "user_id": "uuid",
      "name": "John Doe",
      "role": "admin"
    }
  ],
  "created_at": "2026-02-10T13:00:00Z"
}
```

### Alerts

#### `POST /alerts`

**Description:** Create an alert for episode escalation.

**Request Body:**

```json
{
  "episode_id": "uuid",
  "user_id": "uuid",
  "alert_type": "episode_escalation",
  "severity": "high"
}
```

**Response:**

```json
{
  "alert_id": "uuid",
  "status": "sent",
  "recipients": ["uuid1", "uuid2"]
}
```

### Health Data

#### `POST /health_data/ingest`

**Description:** Ingest bulk health data from wearables or phone sensors.

**Request Body:**

```json
{
  "user_id": "uuid",
  "data_type": "heart_rate",
  "readings": [
    {
      "value": 75,
      "timestamp": "2026-02-10T13:00:00Z"
    }
  ]
}
```

### Community & Zones

#### `GET /community/zones/{zone_id}/status`

**Description:** Get aggregated safety status for a geographic zone.

**Response:**

```json
{
  "zone_id": "uuid",
  "name": "Downtown Athens",
  "active_episodes": 2,
  "risk_level": "moderate",
  "last_updated": "2026-02-10T13:00:00Z"
}
```

## WebSocket Events

### Watch → Relay → Mobile

**Endpoint:** `ws://localhost:8765/ws`

#### Event: `episodestart`

Sent when watch detects anomaly and starts an episode.

```json
{
  "type": "episode-start",
  "userId": "uuid",
  "heartRate": 145,
  "timestamp": "2026-02-10T13:00:00Z"
}
```

#### Event: `pulse-checkin`

Sent when wearer completes contactless check-in on phone.

```json
{
  "type": "pulse-checkin",
  "userId": "uuid",
  "checkInData": {
    "pulse": 82,
    "breathingRate": 16,
    "mood": "calm"
  },
  "timestamp": "2026-02-10T13:03:00Z"
}
```

## Error Handling

### HTTP Status Codes

| Code | Meaning                             |
| ---- | ----------------------------------- |
| 200  | Success                             |
| 201  | Created                             |
| 400  | Bad Request (validation error)      |
| 401  | Unauthorized (invalid/missing auth) |
| 404  | Not Found                           |
| 500  | Internal Server Error               |

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid heart rate value",
    "details": {
      "field": "heart_rate",
      "value": -10
    }
  }
}
```

## Rate Limiting

Currently no rate limiting implemented. Production deployment should add:

- 100 requests/minute per IP for general endpoints
- 1000 requests/minute for health data ingestion
- No limit on WebSocket messages (connection-based throttling instead)
