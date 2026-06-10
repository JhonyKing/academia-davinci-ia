---
name: Blotato API capabilities and limitations
description: Supported endpoints for Blotato v2 API — schedules, media, accounts. DELETE works via /v2/schedules/{id}.
type: project
---

## Blotato API /v2 — Supported endpoints

- `POST /v2/posts` — Create a scheduled post. Returns `{ postSubmissionId: "uuid" }`.
- `POST /v2/media` — Register a media URL. Returns `{ url: "blotato-cdn-url" }`.
- `GET /v2/schedules` — List all scheduled posts.
- `GET /v2/schedules/{id}` — Get one scheduled post by postSubmissionId.
- `PATCH /v2/schedules/{id}` — Update a scheduled post (time or content).
- `DELETE /v2/schedules/{id}` — Delete a scheduled post. ✅ THIS WORKS.
- `GET /v2/users/me/accounts` — List connected accounts.

## CORRECTED: DELETE endpoint is /v2/schedules/{id}

The old endpoint `/v2/posts/{id}` was wrong — it returned 404. The correct endpoint is:

```
DELETE /v2/schedules/{id}
Authorization: blotato-api-key: <key>
```

This was confirmed by reading `blotato_openapi.json` on 2026-03-31.

**Historical note:** Old scripts (`cancel_wrong_posts.py`, `reset_and_cancel_all.py`) used `/v2/posts/{id}` which silently failed. Posts deleted with those scripts were NOT actually deleted. As of 2026-03-30, ~192 old TikTok posts (with videoCoverTimestamp=0) remained as duplicates because the delete calls were hitting the wrong endpoint.

## Authentication

API key header: `blotato-api-key: blt_PXDsPBb6/fGzCMNaqRLMXVnca/HC+A5JYqP8kIYkUHo=`

## Rate limits

0.6s between posts, 3s every 20 posts, 35s on 429 or "already in progress".
