# Mobile Phase 0b Dev Mock Server Implementation Specification

## Context

- Product/design source: `specs/mobile_phase_0b_dev_mock_server_design.spec.md`.
- Backend contract source of truth: `specs/mobile_api_contract_for_rn.spec.md`.
- Phase 0 already provides an Expo + TypeScript app with `npm start`, `npm run android`, `npm test`, and `npm run typecheck`.
- This phase adds local development-only mock mobile API tooling before Phase 1 Settings implementation.

## Requirements

- [ ] Add a repo-local Node/TypeScript mock server under `tools/mock-mobile-api/`.
- [ ] Use Express for simplicity unless existing project conventions clearly favor Fastify.
- [ ] Run with a lightweight TypeScript runner; recommended root script: `mock:api` -> `tsx tools/mock-mobile-api/server.ts`.
- [ ] Default to port `4000`, configurable via `MOCK_API_PORT`.
- [ ] Startup logs must show `http://localhost:4000`, `http://10.0.2.2:4000`, and mock token `dev-mobile-token`.
- [ ] `GET /health` is public; all other endpoints require `Authorization: Bearer dev-mobile-token`.
- [ ] Missing, malformed, or wrong auth returns `401` JSON with `detail`, e.g. `{ "detail": "Missing or invalid mobile API token" }`.
- [ ] The mock must never introduce, request, store, or log `INTERNAL_API_BEARER_TOKEN`.
- [ ] Add shared TypeScript interfaces for status, channel, latest video, activity item, pagination, poll result, sync result, and FastAPI-style errors.
- [ ] Keep seed data in separate module(s), e.g. `seed.ts`, not inline in every route.
- [ ] Implement helper functions for pagination, monitoring filters, query filters, auth errors, validation errors, not-found errors, prerequisite errors, and upstream errors.
- [ ] Use in-memory state initialized from seed data on server start.
- [ ] Keep existing Expo scripts intact.

## Technical Approach

- Add dependencies for the executor: `express`, optional `cors`, dev dependency `tsx`, and relevant types such as `@types/express` and `@types/cors` if used.
- Model the mock after the mobile API contract and keep response shapes contract-compatible.
- Use stateful in-memory data for session-local UI behavior:
  - `PATCH /internal/channels/:channel_id/monitoring` updates channel state for the session.
  - Sync may update summary/status values but must not auto-enable monitoring, baseline all channels, or create notifications.
  - Run poll may update status/activity only in controlled scenarios and only for monitored channels.
  - Reset may be restart-only; if an endpoint is added, use `POST /__mock/reset` and clearly keep it outside the backend contract.
- Implement route-specific scenario controls with query param `scenario`; unknown scenarios should return `422`.
- Use JSON `detail` consistently for expected errors, including `401`, `404`, `409`, `422`, and `502`. Validation errors may be simplified but should resemble FastAPI style enough for React Native error handling.

## Implementation Steps

1. Create `tools/mock-mobile-api/` with `server.ts`, shared types, seed data, and helpers.
2. Configure server startup to read `MOCK_API_PORT`, default to `4000`, bind locally, and print host URL, Android Emulator URL, and `dev-mobile-token`.
3. Add auth middleware: allow unauthenticated `GET /health`; protect all other routes with mobile bearer token validation.
4. Implement `GET /health` returning `{ "status": "ok" }`.
5. Implement `GET /status` returning a contract-compatible status object with scenarios:
   - default normal/ready
   - `degraded` for not ready
   - `quota_blocked` for safety stop
   - `upstream_error` returning `502`
6. Implement `GET /internal/channels`:
   - Validate `monitoring` as `monitored|unmonitored|all`, default `monitored`.
   - Validate `limit` as `1..200`, default `50`; validate `offset >= 0`, default `0`.
   - Apply monitoring filter, case-insensitive title/query search, and pagination.
   - Return `{ channels, pagination }`.
   - Seed at least 2 monitored channels, 2 unmonitored channels, one `latest_detected_video`, and one null `latest_detected_video`.
7. Implement `PATCH /internal/channels/:channel_id/monitoring`:
   - Parse numeric `channel_id`.
   - Validate body contains boolean `is_monitored`.
   - Return `404` for unknown channels.
   - Update in-memory state and return `{ channel_id, is_monitored, last_seen_video_id, baseline_established_at }`.
   - Do not create old-video notifications or activity as a toggle side effect.
8. Implement `POST /internal/subscriptions/sync`:
   - Default return `{ status: "success", channels_imported, channels_created, channels_updated }`.
   - `scenario=oauth_missing` returns `409` with `detail`.
   - Do not automatically monitor channels or create notifications.
9. Implement `POST /internal/run-poll`:
   - Default return aggregate with `run_outcome`, `channels_processed`, `channels_failed`, `baselines_established`, `new_videos_detected > 0`, `quota_blocked`, and `channel_errors`.
   - Support `scenario=no_new_videos|partial_failure|quota_blocked`.
   - If appending activity, append realistic activity only for monitored channels.
   - For quota blocked, return `quota_blocked: true` and update status/quota if stateful status updates are implemented.
10. Implement `GET /internal/activity`:
    - Validate `status` as `all|pending|delivered|pending_retry|failed`, default `all`.
    - Validate limit/offset like channels.
    - Return `{ items, pagination }`.
    - Seed delivered, pending, pending_retry, and failed activity items.
    - Keep read-only with no side effects.
11. Add root `mock:api` script and required package entries without changing existing Expo script behavior.

## Acceptance Criteria

- [ ] `npm run mock:api` starts the mock server and logs the localhost URL, Android Emulator URL, and `dev-mobile-token`.
- [ ] `GET http://localhost:4000/health` returns `{ "status": "ok" }` without auth.
- [ ] Protected endpoints without token, malformed token, or wrong token return `401` with JSON `detail`.
- [ ] `GET /status` with `Authorization: Bearer dev-mobile-token` returns normal status by default.
- [ ] Status scenarios return expected degraded, quota blocked, and upstream `502` responses.
- [ ] Channels filtering, case-insensitive search, and pagination work and validate invalid inputs with `422`.
- [ ] Patching monitoring changes subsequent channel responses during the same server session.
- [ ] Sync default succeeds and `scenario=oauth_missing` returns `409` without enabling monitoring or creating notifications.
- [ ] Poll scenarios produce normal, no-new-videos, partial-failure, and quota-blocked responses; stateful side effects only affect monitored channels.
- [ ] Activity filtering and pagination work with delivered, pending, pending_retry, and failed seed items and no side effects.
- [ ] Existing `npm run typecheck` and `npm test` still pass if implementation touches TypeScript/package configuration.
- [ ] Android Emulator can later use `apiBaseUrl=http://10.0.2.2:4000` and token `dev-mobile-token` once Phase 1 Settings exists.
- [ ] Implementation does not add real DB, Google OAuth, YouTube, Resend, QStash, push notification, production backend contract changes, real tokens, or Expo Router.
- [ ] Implementation does not implement mobile app Settings Phase 1.
