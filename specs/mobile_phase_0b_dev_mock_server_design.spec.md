# Mobile Phase 0b Dev Mock Server Design Specification

## Context

- Phase 0 established the Expo + TypeScript mobile app foundation and verified Android Emulator development works.
- Phase 0b defines development-only product support tooling before implementation specs: a local mock mobile API server that lets the React Native/Expo app run and test MVP flows without the real backend running locally or on Render.
- Phase 1 Settings needs `GET /status` for Save/Test flows. Later phases need channels, manual actions, and activity endpoints.
- The backend contract source of truth remains `specs/mobile_api_contract_for_rn.spec.md`; this mock must mirror that contract for UI development without changing production backend behavior.
- Mobile uses `MOBILE_API_BEARER_TOKEN`. The mock must never introduce, require, or reference `INTERNAL_API_BEARER_TOKEN`.
- Android Emulator must use `http://10.0.2.2:<port>` to reach the host machine mock server. Host browser/tools can use `http://localhost:<port>`.

## Requirements

- [ ] Provide a local development-only mock server design for all MVP mobile backend contract endpoints.
- [ ] Run separately from Expo Metro on a stable port, recommended `4000`.
- [ ] Allow the app `apiBaseUrl` to point to the mock, e.g. `http://10.0.2.2:4000` in Android Emulator.
- [ ] Be deterministic enough for UI development while supporting controlled scenarios for success and failure states.
- [ ] Require mobile bearer auth for protected endpoints using one documented local-only token: `dev-mobile-token`.
- [ ] Return FastAPI-style JSON error bodies using `detail` for expected error cases.

## Technical Approach

- Implement the mock as an external local server in the repo in a future implementation, for example `tools/mock-mobile-api/` or similar.
- Keep it independent of Expo Metro so it can be started, stopped, and reset without blocking mobile development.
- Prefer stateful in-memory seed data for a single server session so UI toggles, manual poll actions, and activity/status updates can be observed without a database.
- Reset behavior may be provided by restarting the server. An optional dev-only reset endpoint may be added, but it must not be treated as part of the mobile backend contract.
- Scenario selection should be design-level and controlled by an implementation-chosen mechanism such as query parameter, request header, environment variable, or local admin/reset command.
- The mock must not define new production contract semantics. Any mismatch or ambiguity must defer to `specs/mobile_api_contract_for_rn.spec.md`.

## Mock Endpoint Stubs

### `GET /health`

- Public endpoint with no auth required.
- Default response: `{ "status": "ok" }`.

### `GET /status`

- Requires mobile bearer auth by default.
- Accepts only the local mock bearer token `dev-mobile-token` for authenticated mock responses.
- Returns a realistic status shape including:
  - `service`
  - `environment`
  - `ready`
  - `subscription_sync`
  - `polling.last_run`
  - `email`
  - `quota`
  - `channels`
- Must support controlled scenarios:
  - normal/ready
  - degraded/not ready
  - quota blocked/safety stop
  - auth failure `401`
  - upstream/operational `502`

### `GET /internal/channels`

- Requires mobile bearer auth.
- Supports `monitoring=monitored|unmonitored|all`; default is `monitored`.
- Supports `query`, `limit`, and `offset` behavior at mock level.
- Returns a channel list with pagination metadata and realistic `latest_detected_video` values, including nullable values.
- Seed data must include:
  - at least two monitored channels
  - at least two unmonitored channels
  - at least one channel with `latest_detected_video`
  - at least one channel without latest detected video

### `PATCH /internal/channels/{channel_id}/monitoring`

- Requires mobile bearer auth.
- Request body: `{ "is_monitored": boolean }`.
- Prefer updating in-memory mock state for UI toggles during a server session.
- If implemented statelessly, returns a deterministic updated response matching the requested monitoring value.
- Unknown `channel_id` returns `404` with FastAPI-style `{ "detail": ... }`.
- Invalid body returns `422` style JSON error.
- Must preserve product semantics: enabling monitoring affects future eligibility only and does not create old-video notifications.

### `POST /internal/subscriptions/sync`

- Requires mobile bearer auth.
- Returns an aggregate sync response with fields such as:
  - `status`
  - `channels_imported`
  - `channels_created`
  - `channels_updated`
- Must not automatically enable monitoring.
- Must not create baselines for all channels.
- Must not create notifications.
- Must support a controlled `409` OAuth prerequisite-not-met scenario.

### `POST /internal/run-poll`

- Requires mobile bearer auth.
- Returns an aggregate run response with:
  - `run_outcome`
  - `channels_processed`
  - `channels_failed`
  - `baselines_established`
  - `new_videos_detected`
  - `quota_blocked`
- Must support controlled scenarios:
  - normal success
  - no new videos
  - partial/channel failure
  - quota blocked
- In stateful mode, may append/update mock activity and status data.
- Any stateful poll effects must only affect monitored channels.

### `GET /internal/activity`

- Requires mobile bearer auth.
- Supports `status=all|pending|delivered|pending_retry|failed`; default is `all`.
- Supports `limit` and `offset` pagination.
- Returns items with:
  - `activity_id`
  - `delivery_id`
  - `video_id`
  - `youtube_video_id`
  - `video_title`
  - `youtube_url`
  - `channel_id`
  - `channel_title`
  - `delivery_status`
  - `published_at`
  - `detected_at`
  - `last_attempt_at`
  - `last_error`
- Seed data must include delivered, pending, pending_retry, and failed activity items.
- Activity is read-only. This endpoint must not retry, send, poll, or cause side effects.

## Mock Data Scenarios

- Default seed state should be stable across restarts and suitable for screenshots/manual QA.
- Scenario support must include:
  - ready backend status
  - degraded/not-ready backend status
  - quota blocked/safety stop status
  - authentication failure
  - upstream/operational `502`
  - OAuth prerequisite `409` for subscription sync
  - poll success, no-op, partial failure, and quota blocked outcomes
- Scenario selection must be explicit and documented by the future implementation.
- Stateful mode should keep changes in memory only for the server session.

## Security And Safety

- The mock is local development tooling only and not product behavior.
- No real credentials may be required, stored, logged, or called.
- No real Google OAuth, YouTube API, Resend/email, QStash, or production backend calls are allowed.
- The only documented mock token is fake and local-only: `dev-mobile-token`.
- The mock must use mobile bearer auth semantics only and must never introduce or use `INTERNAL_API_BEARER_TOKEN`.
- Do not describe the mock token as production, staging, or deployment auth.
- Protected endpoints must return `401` for missing, malformed, or wrong bearer tokens.

## Developer UX

- Future implementation should provide a clear startup command, for example `npm run mock:api`.
- Startup console output should clearly show:
  - host URL, e.g. `http://localhost:4000`
  - Android Emulator URL, e.g. `http://10.0.2.2:4000`
  - local mock token: `dev-mobile-token`
- The mock must run on its own port and must not block or replace Expo Metro.
- Developers should configure the mobile app `apiBaseUrl` to the mock URL during local UI development.
- Physical device usage should be documented with a LAN IP note, e.g. use `http://<host-lan-ip>:4000` when the device can reach the development machine.
- Optional reset functionality, if included, must be clearly marked dev-only and outside the production mobile backend contract.

## Out Of Scope

- Full backend business logic.
- Database persistence.
- Real Google OAuth, YouTube API, Resend/email, or QStash integration.
- Push notification endpoints.
- Contract changes to the production backend.
- Automated e2e tests, unless a later phase explicitly adds them.
- Production or staging deployment of the mock server.

## Acceptance Criteria

- [ ] Exactly one development mock server design exists for Phase 0b and is documented as local tooling only.
- [ ] The design recommends an external repo-local mock server running separately from Expo Metro on port `4000`.
- [ ] The design documents Android Emulator access via `http://10.0.2.2:4000` and host access via `http://localhost:4000`.
- [ ] The design documents `dev-mobile-token` as the only local mock mobile bearer token.
- [ ] The design explicitly prohibits `INTERNAL_API_BEARER_TOKEN` usage.
- [ ] `GET /health` is documented as public and returns `{ "status": "ok" }` by default.
- [ ] `GET /status` is documented with mobile auth, realistic status shape, and ready/degraded/quota/auth/502 scenarios.
- [ ] `GET /internal/channels` is documented with auth, monitoring filter, query, limit, offset, pagination, nullable latest video, and required seed channel coverage.
- [ ] `PATCH /internal/channels/{channel_id}/monitoring` is documented with auth, body validation, preferred in-memory state, `404`, `422`, and future-eligibility-only semantics.
- [ ] `POST /internal/subscriptions/sync` is documented with auth, aggregate response, no automatic monitoring/baseline/notification side effects, and `409` OAuth prerequisite scenario.
- [ ] `POST /internal/run-poll` is documented with auth, aggregate response, normal/no-new-videos/partial-failure/quota-blocked scenarios, and monitored-channel-only side effects.
- [ ] `GET /internal/activity` is documented with auth, status filter, pagination, required item fields, delivered/pending/pending_retry/failed seed data, and read-only behavior.
- [ ] Error handling expectations cover FastAPI-style JSON `detail` responses for `401`, `404`, `409`, `422`, and `502`.
- [ ] No-token and wrong-token behavior is documented as `401` for protected endpoints.
- [ ] Developer UX expectations include startup command guidance, console URLs, mock token display, reset/restart behavior, and physical device LAN IP note.
