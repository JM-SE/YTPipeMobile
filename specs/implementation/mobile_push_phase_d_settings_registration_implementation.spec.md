# Mobile Push Phase D Settings/Registration Implementation Specification

## Context

YTPipeMobile is an Expo + TypeScript mobile app with React Navigation, TanStack Query, Zod validation at API boundaries, SecureStore/AsyncStorage-backed config, NetInfo offline UX, shared API client/query patterns, and a modular Settings screen/controller/components architecture.

This spec refines Phase D from `specs/implementation/mobile_push_notifications_implementation.spec.md` using the backend source of truth in `specs/mobile_push_rn_handoff.spec.md`.

Existing `/status`, `/internal/channels`, `/internal/activity`, and `POST /internal/run-poll` behavior remains unchanged in Phase D.

## Phase D Goal

Safely connect one Expo installation to the backend and expose Settings controls/diagnostics for push status, registration, global enablement, unregister, and test push.

## Requirements

- [ ] Install/configure `expo-notifications` through the Expo-compatible path selected by the implementer.
- [ ] Validate Android notification channel, Expo project ID, EAS/dev-client, and local development constraints before relying on real device push tests.
- [ ] Generate and persist one local `installation_id` UUID per app installation.
- [ ] Store `installation_id` separately from the SecureStore bearer token; prefer AsyncStorage/non-secret storage.
- [ ] Add Phase D push DTOs/types and lenient Zod response schemas.
- [ ] Add push API functions using the existing authenticated API client; do not create a duplicate fetch/auth stack.
- [ ] Add query keys, query hooks, and mutations for status, register, unregister, global settings, and test push.
- [ ] Add a Push Settings section/component inside the existing Settings architecture without bloating `SettingsScreen`.
- [ ] Prompt for notification permission only from Settings after valid backend config exists.
- [ ] Obtain Expo push token only after permission is granted, then register with backend.
- [ ] Global enable toggle must send both `enabled` and `default_for_monitored_channels`, preserving existing/default `true` for the latter.
- [ ] Send Test button appears in Settings and is enabled only when registered, online, and otherwise eligible.
- [ ] NetInfo offline guard disables register, unregister, settings, and test mutations while keeping cached state visible.
- [ ] Clear Config attempts best-effort unregister before clearing local config/token, then removes local push installation state as appropriate.
- [ ] Permission revoked/denied shows disabled/unavailable state and attempts best-effort unregister when possible.

## Out Of Scope

- Channel preference UI, channel list badges, and Channel Detail push switches; defer to Phase E.
- Notification tap handling, Activity navigation, and foreground/background listener behavior beyond basic permission/token acquisition; defer to Phase F.
- Staging polish beyond basic Phase D checks; defer to Phase G.
- Backend changes, endpoint changes, DTO changes, queue/worker/receipt-dashboard features, quiet hours, public auth/login, or native direct FCM/APNs provider implementation.
- Adding push fields to existing `/internal/channels` responses.
- Changing existing `/status`, `/internal/channels`, `/internal/activity`, or `POST /internal/run-poll` contracts.

## Technical Approach

Extend current mobile patterns:

- Use the existing config and API client so every mobile-push request receives `Authorization: Bearer <MOBILE_API_BEARER_TOKEN>` from `mobileApiToken`.
- Keep request and response DTO property names snake_case exactly at the API boundary.
- Validate all backend responses with lenient Zod schemas that tolerate nullable timestamps and extra fields.
- Use TanStack Query for status and mutation state, with query keys that include `installation_id` where necessary but never include bearer tokens or raw Expo push tokens.
- Keep permission and Expo token helpers isolated from Settings UI components.
- Keep Settings UI modular by adding a dedicated Push Settings section/controller hook.
- Prefer cached status display while offline; block state-changing calls offline.

## Backend Contract Used In Phase D

All endpoints require `Authorization: Bearer <MOBILE_API_BEARER_TOKEN>` through the existing shared API client. Never use `INTERNAL_API_BEARER_TOKEN` in mobile.

1. `GET /internal/mobile-push/status?installation_id=<uuid>`
   - Response contains `global`, `installation`, and `delivery`.
   - Unknown installation returns `200` with `installation.registered:false`.
   - Errors: `401`, `422`.
2. `POST /internal/mobile-push/register`
   - Body: `{ installation_id, expo_push_token, platform, app_version, build_number, device_name }`.
   - Response: `{ installation_id, registered, enabled, global_enabled, token_masked, last_registered_at }`.
3. `DELETE /internal/mobile-push/installations/{installation_id}`
   - Idempotent; unknown IDs succeed with `registered:false`.
   - Response: `{ installation_id, registered:false, enabled:false, unregistered_at }`.
4. `PATCH /internal/mobile-push/settings`
   - Body: `{ enabled: boolean, default_for_monitored_channels: boolean }`.
   - Response: `{ enabled, default_for_monitored_channels, first_enabled_at, updated_at, monitored_channels_effectively_enabled_count }`.
5. `POST /internal/mobile-push/test`
   - Body: `{ installation_id }`.
   - Response: `{ sent, installation_id, event_type:'test', last_attempt_at, expo_status, expo_ticket_id, message }`.
   - Errors: `401`, `409` provider disabled/unknown/unregistered/disabled/invalid installation, `422`, `502`.

## Files / Modules

Suggested paths; implementer may adapt to existing naming conventions while preserving responsibilities.

- `package.json`: add `expo-notifications` only via Expo-compatible install command.
- `app.json`, `app.config.ts`, or equivalent Expo config: validate/add notification plugin settings and project ID as required.
- `src/api/mobilePushTypes.ts` or `src/api/types.ts`: Phase D request/response DTO types.
- `src/api/validation/mobilePushSchemas.ts` or existing validation schema module: Phase D Zod schemas.
- `src/api/mobilePushApi.ts` or existing API module: Phase D API functions using shared client.
- `src/api/queryKeys.ts`: `mobilePush` query key factory and invalidation predicates.
- `src/hooks/useMobilePushStatus.ts`: status query hook if project separates hooks.
- `src/hooks/useMobilePushMutations.ts`: register/unregister/settings/test mutations if project separates hooks.
- `src/storage/pushInstallationStorage.ts` or existing storage module: installation ID get/create/delete helpers.
- `src/notifications/pushRegistration.ts`: permission, project ID, Expo token, platform/app metadata helpers.
- `src/screens/Settings/PushSettingsSection.tsx`: Settings push UI section.
- `src/screens/Settings/usePushSettingsController.ts` or existing Settings controller: derived states/actions for Push Settings.
- Existing Settings config/Clear Config controller module: best-effort unregister before local deletion.
- Existing tests near affected modules: validation, API, storage, hooks, Settings UI, Clear Config.

## Execution Steps

Tech-lead must execute in this order:

1. Inspect existing Settings, API client, query key, storage, NetInfo, and test patterns.
2. Add/validate `expo-notifications` dependency and Expo config through the Expo-compatible route; document any dev-client or physical-device limits in implementation notes.
3. Add installation ID storage helpers and tests.
4. Add Phase D DTO interfaces/types.
5. Add Phase D Zod schemas and validation tests using backend sample payloads and nullable/unknown-field variants.
6. Add API functions using the existing shared authenticated client and exact snake_case paths/bodies.
7. Add `mobilePush` query keys and status/mutation hooks with offline/config/permission enabled rules.
8. Add permission/token helper module for Settings-triggered permission request and Expo push token acquisition.
9. Add Push Settings controller/hook that composes config readiness, installation ID, permission status, status query, NetInfo, and mutations.
10. Add Push Settings section UI inside existing Settings screen architecture.
11. Implement global enable toggle preserving `default_for_monitored_channels` from current status, defaulting to `true` when absent.
12. Implement Send Test action enabled only for registered/online/valid-config state.
13. Integrate Clear Config best-effort unregister before existing local config deletion without blocking deletion on unregister failure.
14. Add permission denied/revoked detection on Settings focus and/or app foreground where practical; attempt best-effort unregister only when config, installation ID, and network exist.
15. Add/update focused tests.
16. Run verification commands and manual Settings registration/test checklist.

## DTOs And Validation

Types should preserve backend snake_case DTO names at the API boundary. Suggested names:

- `MobilePushStatusResponse`
- `MobilePushGlobalStatusDto`
- `MobilePushInstallationStatusDto`
- `MobilePushDeliveryStatusDto`
- `RegisterMobilePushInstallationRequest`
- `RegisterMobilePushInstallationResponse`
- `UnregisterMobilePushInstallationResponse`
- `PatchMobilePushSettingsRequest`
- `PatchMobilePushSettingsResponse`
- `SendMobilePushTestRequest`
- `SendMobilePushTestResponse`

Schema plan:

- `mobilePushStatusResponseSchema`
  - Object with `global`, `installation`, `delivery`.
  - Timestamps nullable/optional strings where backend may return `null`.
  - `installation.registered` required boolean; unknown installation must validate.
- `registerMobilePushInstallationResponseSchema`
  - Required `installation_id`, `registered`, `enabled`, `global_enabled`, `token_masked`, `last_registered_at`.
- `unregisterMobilePushInstallationResponseSchema`
  - Required `installation_id`, `registered`, `enabled`, `unregistered_at`.
  - Allow `unregistered_at:null` only if existing backend fixtures require it; otherwise string.
- `patchMobilePushSettingsResponseSchema`
  - Required booleans and count; nullable `first_enabled_at`; required/nullable `updated_at` based on handoff examples.
- `sendMobilePushTestResponseSchema`
  - `event_type` literal `'test'`; nullable/optional `expo_status` and `expo_ticket_id` only if backend can omit them on partial provider responses.

Validation must be lenient with extra keys but strict enough to catch wrong top-level shapes, wrong snake_case names, and invalid booleans/counts.

## Storage Plan

Suggested storage function names:

- `getPushInstallationId(): Promise<string | null>`
- `getOrCreatePushInstallationId(): Promise<string>`
- `setPushInstallationIdForTest(installationId: string): Promise<void>` only if project test patterns require it.
- `clearPushInstallationId(): Promise<void>`
- `maskInstallationId(installationId: string): string` for optional diagnostics.

Rules:

- Generate UUID once per app installation and reuse for status/register/unregister/test.
- Store in AsyncStorage or existing non-secret storage, not SecureStore unless project consistency requires it.
- Keep `mobileApiToken` in existing SecureStore-backed config.
- Do not persist raw Expo push token unless the Expo implementation requires it; backend returns `token_masked` for display.
- Clear Config removes local push installation state after best-effort unregister and existing config deletion flow reaches its local cleanup step.

## API Functions

Suggested function signatures:

```ts
getMobilePushStatus(config: BackendConfig, installationId: string): Promise<MobilePushStatusResponse>
registerMobilePushInstallation(config: BackendConfig, body: RegisterMobilePushInstallationRequest): Promise<RegisterMobilePushInstallationResponse>
unregisterMobilePushInstallation(config: BackendConfig, installationId: string): Promise<UnregisterMobilePushInstallationResponse>
patchMobilePushSettings(config: BackendConfig, body: PatchMobilePushSettingsRequest): Promise<PatchMobilePushSettingsResponse>
sendMobilePushTest(config: BackendConfig, body: SendMobilePushTestRequest): Promise<SendMobilePushTestResponse>
```

Implementation requirements:

- Use existing shared API client/query helper and existing auth injection.
- Do not duplicate `fetch`, base URL normalization, bearer handling, timeout, or redaction logic.
- Encode `installation_id` safely in query/path segments.
- Parse every successful response through the matching Zod schema before returning.
- Preserve exact snake_case request bodies.

## Query And Mutation Hooks

Suggested query keys:

- `queryKeys.mobilePush.all`
- `queryKeys.mobilePush.status(installationId)`
- `queryKeys.mobilePush.settings()` only if settings are split later; Phase D may use status only.
- `queryGuards.hasBackendConfig(config)` or existing equivalent.
- `queryGuards.isOnline(netInfo)` or existing equivalent.

Suggested hooks:

- `useMobilePushStatus({ config, installationId })`
- `useRegisterMobilePushInstallation()`
- `useUnregisterMobilePushInstallation()`
- `usePatchMobilePushSettings()`
- `useSendMobilePushTest()`

Hook behavior:

- Status query enabled only when backend config and `installation_id` exist.
- Register mutation flow: validate config and online, request permission from Settings action, obtain Expo token, build metadata, call register, invalidate status.
- Unregister mutation: validate config/online/installation ID, call delete, invalidate status on settled.
- Settings mutation: validate config/online, send both `enabled` and `default_for_monitored_channels`, update/invalidate status on success.
- Test mutation: validate config/online/registered, send `{ installation_id }`, invalidate status on settled to refresh delivery diagnostics.
- Query keys may include `installation_id` but must not include bearer token, raw Expo push token, `INTERNAL_API_BEARER_TOKEN`, provider credentials, or raw token values.

## Settings UX

Add a `PushSettingsSection` with these states and controls:

- Config missing/invalid:
  - Show push setup blocked copy and link/focus to backend config fields.
  - Disable request permission, register, unregister, global toggle, and test.
- Offline:
  - Show existing offline banner/pattern.
  - Keep cached status visible.
  - Disable register, unregister, global toggle, and test.
- Permission not requested:
  - Show `Enable notifications` / `Set up push notifications` action.
  - Action enabled only when config valid and online.
  - Do not prompt automatically.
- Permission granted but not registered:
  - Show `Register this device` or automatic continuation after permission action.
  - Enable retry registration when online/config valid.
- Permission denied/revoked/unavailable:
  - Show disabled/unavailable copy and platform settings guidance if available.
  - Disable register/test/global mutation actions that require a valid registered installation.
  - Attempt best-effort unregister when possible.
- Registered, global disabled:
  - Show registered state, backend `token_masked`, optional masked `installation_id`, global toggle off, and default-for-monitored explanation.
  - Enable global toggle when online.
  - Enable unregister when online.
  - Enable Send Test only if backend allows test independent of global disabled; otherwise disable with copy. Prefer backend result handling if uncertain.
- Registered, global enabled:
  - Show global toggle on, default-for-monitored explanation, effective count if returned, and delivery diagnostics.
  - Enable Send Test when online and registered.

Button enable/disable rules:

- Permission/setup button: enabled when config valid, online, not already registered, and mutation idle.
- Retry register: enabled when config valid, online, permission granted, installation ID available, and mutation idle.
- Unregister: enabled when config valid, online, installation ID available, and registered or status unknown but local ID exists.
- Global toggle: enabled when config valid, online, registered, permission granted, and settings mutation idle.
- Send Test: enabled when config valid, online, registered, installation ID available, permission granted, and test mutation idle.
- Clear Config: remains available per existing behavior; it may show progress while best-effort unregister runs.

Diagnostics display:

- Show `token_masked`, `last_registered_at`, `last_attempt_at`, `last_success_at`, `last_expo_status`, and safe `last_error` summary when available.
- Avoid full raw `installation_id`; if shown, mask/truncate.
- Never show raw bearer token, raw Expo push token, internal token, provider credentials, or raw token values.

## Clear Config And Permission Revoked Flow

Clear Config integration strategy:

1. Before deleting local config, read current config and `installation_id`.
2. If config exists, `installation_id` exists, and NetInfo is online, call unregister via existing API client.
3. Treat unregister as best-effort: catch `401`, `409`, `422`, network, timeout, and non-JSON failures without preventing local deletion.
4. Continue existing Clear Config flow exactly for SecureStore config/token deletion.
5. Clear local push installation state after unregister attempt/local config cleanup.
6. Invalidate/remove push status queries so stale registered state is not shown after config is cleared.
7. Show only safe user copy, e.g. `Local config cleared. Device unregister could not be confirmed while offline.` when relevant.

Permission revoked/denied strategy:

1. Refresh permission state on Settings focus and/or app foreground where practical.
2. If previously registered and permission is now denied/revoked/unavailable, show push unavailable.
3. If config, installation ID, and network are available, attempt unregister best-effort.
4. Keep local installation ID unless Clear Config is executed; re-registration with the same ID is acceptable after permission is granted again.
5. Disable test/settings actions until permission is granted and backend status is healthy.

## Error Handling

- `401`: show auth/config error; suggest checking `apiBaseUrl` and mobile bearer token. Do not reveal token values.
- `409` test/provider disabled: show provider disabled/unavailable copy.
- `409` unknown/unregistered/disabled/invalid installation: show re-register action and invalidate status.
- `422`: show validation/config mismatch copy; include only safe endpoint category and HTTP status in development logs.
- `502`: show Expo/provider failure and retry-later copy.
- Offline: disable mutations and keep cached state visible.
- Permission denied: show platform settings guidance; do not loop prompts.
- Non-JSON/timeouts: use existing API error handling and redaction.

## Security Requirements

- [ ] All Phase D endpoints use `Authorization: Bearer <MOBILE_API_BEARER_TOKEN>` via the existing shared API client.
- [ ] Mobile never uses, stores, displays, logs, or accepts `INTERNAL_API_BEARER_TOKEN` as a mobile credential.
- [ ] Do not include raw bearer token, raw Expo push token, internal token, provider credentials, or raw token values in UI, logs, errors, analytics, screenshots, fixtures, or query keys.
- [ ] Do not store Expo provider credentials in mobile.
- [ ] `installation_id` may appear in query keys and `/status` query/path usage; bearer tokens and Expo push tokens may not.
- [ ] Prefer backend `token_masked`, masked installation ID, safe endpoint category, and HTTP status for diagnostics.
- [ ] Notification permission/token helper must not log raw Expo push token.
- [ ] Test fixtures must use fake placeholder values and no real tokens.

## Tests

Add/update focused tests according to existing project test conventions:

- Storage tests:
  - creates UUID when missing;
  - reuses existing UUID across calls;
  - clears UUID on clear helper;
  - does not interact with SecureStore bearer token storage.
- Zod/schema tests:
  - validate status registered and unknown-installation responses;
  - validate register/unregister/settings/test responses;
  - tolerate nullable timestamps and extra fields;
  - reject wrong top-level shape or camelCase replacement fields.
- API function tests:
  - exact endpoint paths and methods;
  - exact snake_case request bodies;
  - shared client/auth path is used;
  - schemas parse responses;
  - no raw tokens in thrown/displayed errors.
- Query/hook tests:
  - status disabled without config or installation ID;
  - mutations disabled/fail fast offline;
  - register invalidates status;
  - settings sends both fields and preserves/defaults `default_for_monitored_channels`;
  - test invalidates status on settled;
  - query keys do not contain bearer or Expo token.
- Settings UI/controller tests:
  - missing config state;
  - permission not requested and Settings-only prompt action;
  - denied/revoked state;
  - granted/not registered retry;
  - registered/global disabled;
  - registered/global enabled;
  - offline cached state with disabled controls;
  - test success and `409`/`502` friendly failures.
- Clear Config tests:
  - unregister attempted before local deletion when online/config/ID exist;
  - local deletion proceeds when unregister fails;
  - local installation state cleared;
  - no secret values logged.

## Verification

Suggested commands; adapt to project scripts:

- `npm test` or project test command.
- `npm run typecheck` or project TypeScript check command.
- `npm run lint` if linting is part of project norms.
- Expo preflight/start command used by the project, such as `npx expo start` or dev-client workflow.

Manual Phase D checklist:

- [ ] Save valid `apiBaseUrl` and `mobileApiToken` in Settings.
- [ ] Verify `/health` and existing protected mobile calls still work.
- [ ] Verify wrong token produces safe `401` copy without exposing token values.
- [ ] Confirm no first-launch permission prompt occurs.
- [ ] From Settings, request permission and obtain Expo push token.
- [ ] Register installation and verify backend status shows `registered:true` and `token_masked`.
- [ ] Restart app and confirm the same `installation_id` is reused.
- [ ] Toggle global push on with `{ enabled:true, default_for_monitored_channels:true }`.
- [ ] Toggle global push off while preserving current `default_for_monitored_channels`.
- [ ] Send test push and receive it on Android at minimum when provider is enabled.
- [ ] Verify provider disabled/invalid installation `409` and provider `502` show friendly safe copy.
- [ ] Go offline and confirm cached state remains visible while mutations are disabled.
- [ ] Revoke notification permission and confirm disabled/unavailable UI plus best-effort unregister when possible.
- [ ] Clear Config and confirm best-effort unregister is attempted before local config/token deletion, then local push state is removed.
- [ ] Confirm existing `/status`, `/internal/channels`, `/internal/activity`, and `POST /internal/run-poll` behavior remains unchanged.
- [ ] Confirm UI/logs/query keys contain no raw bearer token, raw Expo push token, `INTERNAL_API_BEARER_TOKEN`, provider credentials, or raw token values.

## Acceptance Criteria

- [ ] Phase D uses only the existing shared API client and mobile bearer-token auth path.
- [ ] One local `installation_id` is generated, persisted, reused across restarts, and cleared through Clear Config.
- [ ] Permission prompt is Settings-only and requires valid backend config.
- [ ] Register request body exactly matches `{ installation_id, expo_push_token, platform, app_version, build_number, device_name }`.
- [ ] Status, register, unregister, settings, and test responses are Zod-validated at the API boundary.
- [ ] Settings displays permission state, backend registration state, masked token, global enable/default state, retry/unregister actions, Send Test, and safe delivery diagnostics.
- [ ] Global enable sends both `enabled` and `default_for_monitored_channels`, preserving/defaulting the latter to `true`.
- [ ] Offline state disables register/unregister/settings/test mutations while preserving cached display.
- [ ] Clear Config attempts unregister best-effort and still clears local config when unregister fails.
- [ ] Permission denied/revoked produces disabled/unavailable state and best-effort unregister when possible.
- [ ] Send Test succeeds for a registered online installation and surfaces `409`/`502` safely.
- [ ] Existing `/status`, `/internal/channels`, `/internal/activity`, and `POST /internal/run-poll` contracts remain unchanged.
- [ ] Raw bearer token, raw Expo push token, `INTERNAL_API_BEARER_TOKEN`, provider credentials, and raw token values never appear in UI, logs, errors, fixtures, or query keys.
