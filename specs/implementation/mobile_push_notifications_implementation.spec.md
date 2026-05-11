# Mobile Push Notifications Implementation Specification

## Context

YTPipeMobile is a React Native/Expo TypeScript app that already uses React Navigation, TanStack Query, Zod response validation at the API boundary, SecureStore/AsyncStorage-backed config, NetInfo offline UX, shared API client/query patterns, Settings, Channels list/detail, and Activity surfaces.

Backend mobile push MVP is implemented, reviewed, and committed through backend phases 11A, 11B, and 11C. Mobile implementation may now proceed against the backend handoff contract. The mobile app must extend existing architecture rather than duplicate API clients, state stores, navigation roots, or config flows.

Dashboard `EmailSummaryCard` remains hidden and is not part of this push work.

## Source Of Truth

- Primary contract source: `specs/mobile_push_rn_handoff.spec.md`.
- Historical product/design source: `specs/mobile_push_notifications_master_cross_repo_draft.spec.md`.
- Existing non-push mobile API source: `specs/mobile_api_contract_for_rn.spec.md`.

Definitive backend facts to preserve exactly:

- Backend mobile push MVP implemented and committed through backend phases 11A, 11B, 11C.
- Push endpoints exist under `/internal/mobile-push/*`.
- Existing `/status`, `/internal/channels`, `/internal/activity`, and `POST /internal/run-poll` response contracts remain unchanged.
- `GET /internal/channels` has no push fields. Use the dedicated preference endpoint.
- All mobile-push endpoints require `Authorization: Bearer <MOBILE_API_BEARER_TOKEN>`.
- Mobile must never use/store/display/log `INTERNAL_API_BEARER_TOKEN`.
- Expo test push exists via `POST /internal/mobile-push/test`.
- Polling new-video push integration exists.
- Push delivery is synchronous best-effort in MVP: no workers, queues, outbox worker, Celery, Redis, or receipt polling dashboard.
- Push failures are recorded but do not fail or roll back polling.
- Manual `POST /internal/run-poll` and QStash/internal poll trigger push identically when new-video conditions are met.

## Requirements

- [ ] Add Expo push notification support using Expo-compatible install/configuration paths and verify Android at minimum.
- [ ] Request notification permission only from Settings after valid backend config exists.
- [ ] Generate and persist one local `installation_id` UUID per app installation.
- [ ] Store `installation_id` separately from the bearer token; prefer AsyncStorage because it is not a bearer token.
- [ ] Keep `mobileApiToken` in existing secure config storage and never expose raw bearer tokens in UI/logs/query keys.
- [ ] Obtain an Expo push token only after OS permission is granted by user action from Settings.
- [ ] Register/update/unregister the current installation against `/internal/mobile-push/*` using snake_case DTOs.
- [ ] Show Settings Push section with permission state, registration state, global enable, retry, send test, and simple delivery diagnostics.
- [ ] Use NetInfo/offline guard: disable register/test/settings/preference mutations while offline while keeping cached state visible.
- [ ] Use dedicated channel preference endpoint for push channel state; do not add push fields to `/internal/channels` DTOs.
- [ ] Show push badge/status in Channels list and a push switch in Channel Detail only for monitored channels.
- [ ] Tapping new-video notifications opens Activity and invalidates/refetches `/internal/activity`; do not deep-link to detail screens yet.
- [ ] Clear Config attempts backend unregister best-effort before local deletion.
- [ ] Permission revoked shows disabled/unavailable state and attempts unregister best-effort.
- [ ] Payload handling must tolerate optional IDs and unknown payload types without crashing.

## Technical Approach

Implement in phases D through G. Extend current app patterns:

- API: extend the shared API client and current `src/api/mobileApi.ts` style, or create `src/api/mobilePushApi.ts` if that better matches existing module organization. Do not create a second fetch/auth stack.
- Types: add push DTOs to `src/api/types.ts` or a push-specific API types module consistent with existing project style.
- Validation: add lenient Zod schemas in `src/api/validation/schemas.ts` or a nearby push schema module and parse every backend response at the API boundary.
- Query: add query keys, predicates, and page-size constants in `src/api/queryKeys.ts`; query keys must never contain bearer tokens, raw Expo tokens, or raw config secrets.
- State/UI: use TanStack Query hooks for reads and mutations. Keep cached status/preferences visible when offline.
- Storage: use existing config controller/storage for secure backend config; add separate installation ID storage.
- Notifications: add/consider `expo-notifications` dependency/plugin, validate Expo project ID/EAS/dev-client requirements, and register notification response listeners at app/root level.

Effective preference model:

```text
settings.enabled
AND user_channel.is_monitored
AND (
  explicit preference if explicitly_set
  else settings.default_for_monitored_channels
)
```

- Global push disabled by default.
- First global enable with `default_for_monitored_channels=true` makes monitored channels effectively enabled unless explicitly disabled.
- Unmonitored channels never push.
- Re-enabled monitoring inherits global default unless explicit preference exists.
- Explicit preference rows may remain while monitoring disabled, but ignored until monitored again.

## Implementation Phases

Execution order is mandatory: Phase D, then E, then F, then G. Do not begin channel UI before Settings registration/status is usable.

### Phase D: Foundations, Settings, Registration, Test

Goal: safely connect one Expo installation to the backend and expose Settings controls/diagnostics.

Implementation order:

1. Validate Expo notifications setup: add/confirm `expo-notifications`, app config plugin requirements, Android notification channel requirements, Expo project ID/EAS/dev-client constraints, and local development constraints.
2. Add local installation ID service that generates one UUID and persists it; expose reset/delete only through Clear Config flow.
3. Add push DTOs and lenient response schemas for status, register, unregister, settings, and test.
4. Add API functions for status/register/unregister/settings/test using existing authenticated API client.
5. Add query keys and hooks/mutations for push status and Settings mutations.
6. Add a modular Push Settings section/component inside existing Settings screen architecture.
7. Add Settings-only permission request flow; do not prompt at first launch or from Channels/Activity.
8. Obtain Expo push token after permission granted, then register with backend.
9. Add global enable toggle using `PATCH /internal/mobile-push/settings` with both required snake_case fields.
10. Add Send Test action using `POST /internal/mobile-push/test`.
11. Integrate Clear Config best-effort unregister before local config deletion.
12. Add permission-revoked detection where practical and best-effort unregister.

Phase D endpoints:

- `GET /internal/mobile-push/status?installation_id=<uuid>`
- `POST /internal/mobile-push/register`
- `DELETE /internal/mobile-push/installations/{installation_id}`
- `PATCH /internal/mobile-push/settings`
- `POST /internal/mobile-push/test`

Phase D acceptance criteria:

- [ ] User with valid config can request OS permission from Settings only.
- [ ] App generates/persists one `installation_id` and reuses it across app restarts.
- [ ] Register request uses exact snake_case body: `{ installation_id, expo_push_token, platform, app_version, build_number, device_name }`.
- [ ] Settings shows permission, installation/registration, masked backend token, global enabled/default, and recent delivery diagnostics when available.
- [ ] Global enable sends `{ enabled: boolean, default_for_monitored_channels: boolean }`; first enable keeps `default_for_monitored_channels=true`.
- [ ] Send Test succeeds against registered installation and surfaces `409`/`502` failures with friendly copy.
- [ ] Offline state disables register/unregister/settings/test mutations but keeps cached status visible.
- [ ] Clear Config attempts unregister best-effort and still clears local config if unregister fails.
- [ ] Raw bearer tokens, raw Expo tokens, and `INTERNAL_API_BEARER_TOKEN` never appear in UI/logs/errors/query keys.

### Phase E: Channel Preference UI

Goal: show and edit effective per-channel push state without changing monitoring semantics or `/internal/channels` contracts.

Implementation order:

1. Add channel preference DTOs and Zod schemas.
2. Add API read/update functions for dedicated push preference endpoints.
3. Add query keys/hooks for channel preferences with default `monitoring=monitored` and project-standard page size.
4. Decide merge strategy for display: keep `/internal/channels` as source for channel list data and overlay preference data by `channel_id` where loaded.
5. Add Channels list push badge/status for monitored channels when preference data is available.
6. Add Channel Detail push switch only when the channel is currently monitored.
7. Disable/hide active push controls for unmonitored channels; do not change monitoring toggle semantics.
8. Invalidate/refetch push preferences after channel preference mutation and after monitoring state changes that affect eligibility.

Phase E endpoints:

- Existing `GET /internal/channels` remains unchanged and has no push fields.
- `GET /internal/mobile-push/channel-preferences?monitoring=monitored|all&query=&limit=&offset=`
- `PATCH /internal/mobile-push/channels/{channel_id}`

Phase E acceptance criteria:

- [ ] Push preference reads use the dedicated endpoint, not `/internal/channels` push fields.
- [ ] Channels list shows badge/status for monitored channels when preferences are loaded.
- [ ] Channel Detail shows an active push switch only for monitored channels.
- [ ] Channel preference patch body is exact snake_case `{ push_enabled: boolean }`.
- [ ] `409` unmonitored and `404` unknown channel errors show friendly messages and trigger safe refetch/rollback.
- [ ] Offline state disables preference mutations while cached badges/switch state remains visible.
- [ ] Re-enabled monitoring behavior is described by UI copy as inheriting backend default unless an explicit preference exists.

### Phase F: Notification Handling And Activity Refresh

Goal: make notification receipt/tap useful without adding new backend DTOs or detail deep links.

Implementation order:

1. Add notification handler/listener module at app/root level, not inside individual screens.
2. Configure foreground notification behavior according to Expo best practices and existing UX conventions.
3. Add notification response handling for warm, background, and cold-start tap cases.
4. For `data.type === 'new_video'`, navigate to Activity tab/screen and invalidate/refetch the existing activity query.
5. Treat `activity_id`, `delivery_id`, `video_id`, and `channel_id` as optional context only.
6. For `data.type === 'test'`, either remain on current screen with system notification behavior or navigate/show Settings confirmation if consistent with existing navigation.
7. Ignore unknown/malformed payloads safely without logging sensitive payload values.

Phase F payload contract:

```json
{ "type": "new_video", "activity_id": 789, "delivery_id": 789, "video_id": 456, "channel_id": 123, "sent_at": "2026-05-08T12:05:00Z" }
```

```json
{ "type": "test", "sent_at": "2026-05-08T12:15:00Z" }
```

Phase F acceptance criteria:

- [ ] New-video notification tap opens Activity consistently from foreground/background/cold start where platform allows.
- [ ] Activity query is invalidated/refetched after tap.
- [ ] Existing Activity loading/empty/error/stale UI handles fetch results.
- [ ] No video/channel detail deep link is added.
- [ ] Unknown or incomplete payloads do not crash the app.
- [ ] Payload handling never logs bearer/internal/provider/raw Expo tokens/internal URLs/stack traces/sensitive diagnostics.

### Phase G: Staging Validation And Polish

Goal: validate end-to-end behavior with a real backend/device and polish copy/states without scope expansion.

Implementation order:

1. Run focused typecheck/tests required by project norms.
2. Validate Android at minimum on Expo/dev-client/EAS path chosen by implementation.
3. Validate a real backend with `MOBILE_API_BEARER_TOKEN` and backend push provider enabled.
4. Verify wrong token `401`, provider disabled/invalid installation `409`, and provider failure `502` UI states.
5. Verify manual `POST /internal/run-poll` and QStash/internal poll behavior from mobile-observable Activity/push outcomes where staging data allows.
6. Polish copy for disabled provider, permission denied/revoked, registration retry, offline mutations, and auth/config errors.
7. Confirm secrets are absent from UI, app logs, screenshots, query keys, error messages, and analytics/debug helpers.

Phase G acceptance criteria:

- [ ] Staging checklist in Verification Plan passes or gaps are documented as environment limitations.
- [ ] Android receives test notification and handles new-video tap path at minimum.
- [ ] Error copy is user-actionable and does not expose raw sensitive values.
- [ ] No scope additions such as quiet hours, delivery history, receipt dashboard, or failure/quota push are introduced.

## Files / Modules To Create Or Modify

Suggested paths; implementer should adapt names to existing project conventions while preserving responsibilities.

- `app.json` or Expo config file: add/validate Expo notifications plugin/config if needed.
- `package.json`: add `expo-notifications` only via Expo-compatible install path.
- `src/api/types.ts` or `src/api/mobilePushTypes.ts`: push DTO request/response types.
- `src/api/validation/schemas.ts` or `src/api/validation/mobilePushSchemas.ts`: lenient Zod schemas.
- `src/api/mobileApi.ts` or `src/api/mobilePushApi.ts`: push API functions using existing authenticated client.
- `src/api/queryKeys.ts`: push query keys, predicates, page size constants, invalidation helpers.
- `src/hooks/useMobilePushStatus.ts`: status query hook if hooks are separated.
- `src/hooks/useMobilePushMutations.ts`: register/unregister/settings/test mutations if hooks are separated.
- `src/hooks/useMobilePushChannelPreferences.ts`: preference query/mutation hooks.
- `src/storage/installationIdStorage.ts` or existing config storage module: local installation ID get/create/delete.
- `src/notifications/pushNotifications.ts`: permission/token helpers and notification listener registration.
- `src/screens/Settings/PushSettingsSection.tsx`: modular Settings Push section.
- `src/screens/Settings/*config controller*`: Clear Config unregister best-effort integration.
- `src/screens/Channels/*`: list badge/status integration.
- `src/screens/ChannelDetail/*`: monitored-only push switch integration.
- `src/navigation/*` or app root: notification response navigation to Activity.
- Existing tests near affected modules: add focused coverage for hooks, storage, API validation, UI states, and navigation handler.

Do not modify backend code, non-mobile specs, or unrelated Dashboard `EmailSummaryCard` behavior for this feature.

## API DTOs And Validation

All push endpoint DTOs are final from the backend handoff. Request bodies must use snake_case exactly.

### Status

- Request: `GET /internal/mobile-push/status?installation_id=<uuid>`.
- Unknown installation returns `200` with `registered:false`.
- Response contains `global`, `installation`, `delivery`.
- Key errors: `401`, `422`.

Required response validation fields:

- `global.enabled`, `global.default_for_monitored_channels`, optional/nullable timestamps.
- `installation.installation_id`, `registered`, `enabled`, `platform`, `app_version`, `build_number`, `device_name`, `token_masked`, registration/seen/unregistered timestamps.
- `delivery.last_attempt_at`, `last_success_at`, `last_error`, `last_expo_ticket_id`, `last_expo_status`, `last_receipt_checked_at`.

### Register

- Request: `POST /internal/mobile-push/register`.
- Body: `{ installation_id, expo_push_token, platform, app_version, build_number, device_name }`.
- Idempotent by `(user_id, installation_id)`; Expo tokens rotatable.
- Response: `{ installation_id, registered, enabled, global_enabled, token_masked, last_registered_at }`.
- Key errors: `401`, `422`.

### Unregister

- Request: `DELETE /internal/mobile-push/installations/{installation_id}`.
- Idempotent; unknown IDs return success with `registered:false`.
- Response: `{ installation_id, registered:false, enabled:false, unregistered_at }`.
- Key errors: `401`, `422`.

### Global Settings

- Request: `PATCH /internal/mobile-push/settings`.
- Body: `{ enabled: boolean, default_for_monitored_channels: boolean }`.
- Global push disabled by default.
- First enable keeps `default_for_monitored_channels=true`.
- Response: `{ enabled, default_for_monitored_channels, first_enabled_at, updated_at, monitored_channels_effectively_enabled_count }`.
- Key errors: `401`, `422`.

### Channel Preferences

- Request: `GET /internal/mobile-push/channel-preferences?monitoring=monitored|all&query=&limit=&offset=`.
- Default `monitoring=monitored`; `monitoring=all` may include unmonitored for diagnostics/future UI.
- Response includes `channels[]` with `channel_id`, `youtube_channel_id`, `title`, `is_monitored`, `push_eligible`, `push_enabled`, `preference: { explicitly_set, explicit_push_enabled, updated_at }`, plus `pagination`.
- Key errors: `401`, `422`.

### Channel Preference Update

- Request: `PATCH /internal/mobile-push/channels/{channel_id}`.
- Body: `{ push_enabled: boolean }`.
- Channel must exist and currently be monitored.
- Response matches one channel preference.
- Key errors: `401`, `404`, `409` unmonitored, `422`.

### Test Push

- Request: `POST /internal/mobile-push/test`.
- Body: `{ installation_id }`.
- Success response: `{ sent, installation_id, event_type:'test', last_attempt_at, expo_status, expo_ticket_id, message }`.
- Key errors: `401`, `409` push provider disabled/unknown/unregistered/disabled/invalid installation, `422`, `502` Expo/provider failure.

## Query / Mutation Plan

- Add stable query keys in `src/api/queryKeys.ts` such as `mobilePush.status(installation_id)` and `mobilePush.channelPreferences(params)`.
- Query keys may include `installation_id`, `monitoring`, `query`, `limit`, and `offset`; they must not include `mobileApiToken`, raw Expo token, or `apiBaseUrl` if existing project patterns avoid config in keys.
- Add invalidation predicates for all push status queries, all push channel preference queries, Activity query, and Channels query when monitoring changes.
- Use status query in Settings once backend config and installation ID are available.
- Use channel preference query in Channels/Channel Detail only when backend config exists; default to `monitoring=monitored`.
- Mutations:
  - Register: obtain permission/token first, then call backend; on success invalidate status.
  - Unregister: call backend with installation ID; on settled invalidate status and allow Clear Config to continue.
  - Settings: patch global settings; on success update/invalidate status and channel preferences.
  - Channel preference: optimistic update optional; if used, rollback on `404`/`409`/offline/error; invalidate preferences after settlement.
  - Test: on success/failure invalidate status to refresh delivery diagnostics.
- Offline guard: if NetInfo reports offline, mutations should be disabled or fail fast with existing friendly offline message.

## Storage Plan

- Keep `mobileApiToken` in existing SecureStore-backed config; never migrate it to AsyncStorage.
- Store `installation_id` in AsyncStorage or existing non-secret persistent storage because it is not a bearer token.
- Generate `installation_id` as UUID once per app installation and reuse for register/status/unregister/test.
- Do not display full `installation_id` except optional short technical diagnostic; if shown, truncate/mask.
- Expo push token is sensitive-ish: avoid raw UI/logging. Do not persist unless implementation requires it; backend status returns `token_masked` for display.
- Clear Config should remove local backend config/token and local push installation state after best-effort unregister.

## Settings UX Plan

Add a Push Settings section/component rather than bloating top-level Settings screen. Show:

- Backend config readiness: missing/invalid config should block permission/register/test and point user to config fields.
- OS permission state: not requested, granted, denied, revoked/unavailable.
- Local installation state: installation ID present/missing, optionally masked.
- Backend registration state: registered/not registered/failed/unknown, masked token from `token_masked` when available.
- Global enable toggle and default-for-monitored explanation.
- Retry registration action when permission is granted but backend registration is missing/failed.
- Send Test action when registered and online.
- Simple delivery diagnostics: last attempt, last success, last error, Expo status/ticket ID if backend returns it; no delivery history screen.
- Friendly statuses for `401`, `409`, `422`, `502`, timeout, and offline.

Do not request permission automatically. Do not prompt from app launch, Dashboard, Channels, or Activity.

## Channel UX Plan

- Channels list remains driven by existing `/internal/channels` data.
- Overlay push badge/status from `/internal/mobile-push/channel-preferences` by `channel_id` when available.
- For monitored channels, badge/status should communicate effective push state: enabled, disabled, or unavailable/global disabled.
- For unmonitored channels, hide push status or show not eligible without an active control.
- Channel Detail shows push switch only for monitored channels.
- Switching push does not toggle monitoring and monitoring toggle does not directly patch push preference.
- If monitoring is disabled, push is ignored/hidden/disabled because unmonitored channels never push.

## Notification Handling Plan

- Register notification listeners once at app/root level after navigation/query client are available.
- New-video tap target: Activity screen/tab only.
- After navigation to Activity, invalidate/refetch existing `/internal/activity` query.
- Treat IDs as optional context for future use; do not require them for navigation.
- Foreground behavior should be simple and platform-appropriate; no custom in-app delivery history is required.
- Test notification payload may be ignored beyond system display or may route to Settings if consistent, but must not introduce new product surfaces.

## Clear Config / Permission Revoked Plan

Clear Config flow:

1. Read current backend config/token and `installation_id` before deleting local state.
2. If config and installation ID exist and app is online, attempt `DELETE /internal/mobile-push/installations/{installation_id}`.
3. Treat unregister as best-effort; do not block local config deletion on network/backend failure.
4. Clear SecureStore config/token and local installation push state.
5. Show transient warning only if useful; do not claim unregister succeeded when it failed.

Permission revoked flow:

1. Detect denied/revoked/unavailable permission on Settings view focus and/or app foreground where practical.
2. Show push disabled/unavailable state.
3. Attempt unregister best-effort when config, installation ID, and network are available.
4. Disable register/test/global/channel mutations until permission is granted again as applicable.

## Error Handling

- `401`: show auth/config error and Open Settings action; do not retry silently forever.
- `404` channel update: show channel no longer exists and refetch Channels/preferences.
- `409` unmonitored channel: show no longer monitored/not eligible and refetch.
- `409` test/provider/installation: show provider disabled, unregistered, disabled, or invalid installation copy based on safe backend detail when available.
- `422`: show validation/config mismatch copy and log only non-sensitive status/context in development.
- `502`: show Expo/provider failure copy and suggest retry later.
- Offline: disable mutations and show cached state with existing offline banner/patterns.
- Timeouts/non-JSON: use existing API error handling and redaction; do not include secrets in thrown/displayed messages.

## Security Requirements

- [ ] Use only `MOBILE_API_BEARER_TOKEN` for protected backend API calls.
- [ ] Never use/store/display/log `INTERNAL_API_BEARER_TOKEN`.
- [ ] Never store Expo provider credentials in mobile.
- [ ] Never include bearer tokens, raw Expo tokens, provider credentials, internal URLs, stack traces, or sensitive diagnostics in notification payload handling/logs/UI.
- [ ] Do not include raw tokens in query keys, persisted debugging state, screenshots, or test fixtures committed to repo.
- [ ] Prefer masked values: backend `token_masked`, truncated installation ID, HTTP status, safe endpoint category.
- [ ] Preserve existing HTTPS/dev-local URL validation behavior.

## Testing Plan

- Unit/API validation tests for status, register, unregister, settings, channel preferences, channel patch, and test response schemas with nullable/optional backend fields.
- API function tests/mocks ensuring exact snake_case request bodies and endpoint paths.
- Query hook tests for enabled/disabled conditions, invalidations, offline mutation guard, and no token in query keys.
- Storage tests for create/reuse/delete `installation_id`.
- Settings UI tests for no config, permission not requested, denied/revoked, granted/not registered, registered/global disabled, registered/global enabled, test success, test failure.
- Channel UI tests for badge/status, monitored switch visibility, unmonitored hidden/disabled state, mutation rollback/error copy.
- Notification handler tests for new-video tap navigating to Activity and invalidating/refetching activity query; malformed/unknown payload ignored.
- Clear Config tests for unregister attempted before local deletion and local deletion proceeding after unregister failure.
- Security tests/reviews for redaction of bearer/raw Expo tokens.

## Verification Plan

Staging/device checklist:

- [ ] Save `apiBaseUrl` and `mobileApiToken` in mobile Settings.
- [ ] `GET /health` succeeds; protected endpoints reject wrong token and accept mobile token.
- [ ] Verify mobile never accepts/uses `INTERNAL_API_BEARER_TOKEN`.
- [ ] Generate/persist installation ID.
- [ ] Request notification permission from Settings and obtain Expo token.
- [ ] Register installation and verify masked token in status.
- [ ] Enable global push with `default_for_monitored_channels=true`.
- [ ] Send test push and receive it on Android at minimum.
- [ ] Load channel preferences and toggle one monitored channel.
- [ ] Verify `/internal/channels` contract remains unchanged and no push fields are required.
- [ ] Ensure at least one monitored channel has baseline established.
- [ ] Trigger manual poll/new-video path when a genuinely new latest upload is available.
- [ ] Receive new-video push.
- [ ] Tap notification, open Activity, and refetch `/internal/activity`.
- [ ] Verify QStash/internal poll and manual run-poll are mobile-observably identical when new-video conditions are met.
- [ ] Revoke permission and verify disabled/unavailable state plus best-effort unregister.
- [ ] Clear Config and verify best-effort unregister then local deletion.
- [ ] Confirm no secrets in UI, logs, screenshots, or query keys.

## Acceptance Criteria

Overall MVP acceptance:

- [ ] Mobile push implementation follows final backend handoff contract exactly, including snake_case DTOs.
- [ ] All mobile-push calls use `Authorization: Bearer <MOBILE_API_BEARER_TOKEN>` through the existing shared API client.
- [ ] Permission prompt occurs only from Settings after valid backend config.
- [ ] Current installation can register, unregister, refresh status, enable/disable global push, and send test push.
- [ ] Settings shows permission, registration, global enable, retry, send test, and simple delivery diagnostics.
- [ ] Channel list/detail show per-channel push state using the dedicated preference endpoint.
- [ ] Unmonitored channels never expose an active push switch and never appear as push-enabled controls.
- [ ] Notification tap opens Activity and refetches existing activity data.
- [ ] Clear Config and permission revoke attempt unregister best-effort.
- [ ] Offline UX keeps cached state visible and disables unsafe mutations.
- [ ] Existing `/status`, `/internal/channels`, `/internal/activity`, and `POST /internal/run-poll` response contracts remain unchanged.
- [ ] Dashboard `EmailSummaryCard` remains hidden.
- [ ] No raw bearer/internal/provider/raw Expo tokens are stored, displayed, logged, or included in query keys.

## Out Of Scope

- Quiet hours.
- Failure/quota/sync/poll/email error push notifications.
- Push delivery history screen.
- Receipt polling dashboard.
- Workers, queues, outbox worker, Celery, Redis, or mobile UI for backend queue state.
- Deep links to video/channel/activity detail screens.
- Changing backend DTOs, endpoint paths, or existing non-push response contracts.
- Adding push fields to `/internal/channels`.
- Public multi-user auth/login.
- Native direct FCM/APNs provider implementation.
- Dashboard `EmailSummaryCard` visibility changes.
