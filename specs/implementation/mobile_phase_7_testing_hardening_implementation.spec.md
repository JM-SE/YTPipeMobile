# Mobile Phase 7 Testing And Hardening Implementation Specification

## Context

Phase 7 hardens the React Native/Expo YTPipeMobile MVP after Phases 0-6. The product source is `specs/mobile_phase_7_testing_hardening_product.spec.md`.

Current baseline:
- Expo SDK 54, React Native 0.81.5, React 19.1.0, TypeScript.
- Navigation is direct React Navigation.
- Settings uses secure configuration; server state and API access are shared.
- Implemented MVP screens include Dashboard, Channels, Manual actions, and Activity.
- Existing tests live under `src/test/` and currently pass: 20 suites / 68 tests. `npm run typecheck` also passes.
- Known Jest worker teardown warning is non-blocking when test suites pass.
- `zod` is already installed; `@react-native-community/netinfo` is not yet installed.
- API boundary is `src/api/client.ts`, typed endpoint functions are in `src/api/mobileApi.ts`, DTOs are in `src/api/types.ts`, and errors are in `src/api/errors.ts`.

Mobile endpoint responses requiring hardening:
- `GET /status`
- `GET /internal/channels`
- `PATCH /internal/channels/{id}/monitoring`
- `POST /internal/subscriptions/sync`
- `POST /internal/run-poll`
- `GET /internal/activity`

## Requirements

- [ ] Add critical-gap-only hardening tests; do not rewrite exhaustive coverage.
- [ ] Validate all mobile endpoint responses at the API boundary before hooks/UI receive DTOs.
- [ ] Use lenient Zod object schemas that validate required fields/types but tolerate extra backend fields.
- [ ] Avoid `any`; use DTO-aligned schema inference or explicit typed schema helpers.
- [ ] Map response validation failures to `ApiError` kind `parse` or a clearly dedicated validation-response kind.
- [ ] Show friendly user-facing validation/connectivity/security messages without token leakage.
- [ ] Add `@react-native-community/netinfo` using Expo-compatible installation guidance.
- [ ] Add minimal connectivity status support with offline banner and disabled/running UX for key network actions.
- [ ] Add critical automated accessibility tests for primary controls and create an implementation checklist artifact during execution.
- [ ] Perform a focused performance audit for lists, refreshes, duplicate requests, and obvious rerenders.
- [ ] During implementation, create `specs/mobile_phase_7_hardening_checklist.spec.md` to record checklist results, fixes, and deferrals.

## Technical Approach

### Runtime Response Validation

- Add schemas under `src/api/validation/` or `src/api/schemas.ts`.
- Define one schema per mobile endpoint response and reuse nested schemas for channels, activity items, status, manual-action results, and pagination metadata where useful.
- Use `.passthrough()` or equivalent for object schemas so unknown backend fields are tolerated.
- Model nullable/optional fields consistently with existing DTOs in `src/api/types.ts`.
- Parse responses inside `src/api/mobileApi.ts` or the shared API/client path immediately after JSON parsing and before return to hooks/UI.
- Convert validation errors into the existing API error flow. Preferred behavior:
  - `kind: "parse"` if already supported or easy to extend consistently.
  - Otherwise add a dedicated validation response kind only if it fits the existing `ApiError` model.
- Sanitize technical details. Do not include API tokens, authorization headers, configured token values, or full raw response bodies in messages, logs, toasts, or detail reveals.

### Connectivity UX

- Install NetInfo with Expo-compatible guidance, e.g. `npx expo install @react-native-community/netinfo` during implementation.
- Add a small connectivity provider/hook/component using NetInfo state.
- Render one clear offline/connectivity banner at the app shell or screen layout level.
- Disable or guard critical network-only actions when offline, including Settings test/save flows as applicable, Dashboard sync/poll, Channel monitoring toggles, refresh buttons, and Activity pagination/refresh.
- Preserve navigation and display stale cached data where already available; do not implement queued writes or offline-first sync.
- Prefer explicit retry buttons over aggressive automatic retry loops.

### Security, Accessibility, and Performance Hardening

- Security checklist must cover token redaction, absence of internal-token references, safe technical details, config clear/cache invalidation, and safe external YouTube link behavior.
- Accessibility automated tests should focus on highest-risk controls: Settings inputs/save/test/reset, Dashboard sync/poll/refresh, Channel monitoring switches/tabs/search, Activity filters/expand rows/retry/refresh, and offline/error banners.
- Performance audit should focus on Activity and Channels FlatList behavior, page size and `onEndReached` guards, refresh intervals, duplicate request prevention, and manual action disabled/running states.
- Record manual checklist findings and any accepted deferrals in `specs/mobile_phase_7_hardening_checklist.spec.md` during the implementation phase.

## Implementation Steps

1. Review existing tests under `src/test/` and identify only MVP risk gaps against Phase 7 requirements.
2. Add Zod validation schemas for all mobile endpoint responses using lenient object handling and DTO-compatible optional/nullable fields.
3. Integrate schema parsing at the API boundary in the mobile API/client path before data reaches hooks or UI.
4. Map validation failures to sanitized API errors with friendly messages and safe technical details.
5. Add NetInfo via Expo-compatible install and implement a minimal connectivity provider/hook/banner.
6. Integrate offline disabled/guarded states for key network actions without changing product scope.
7. Add critical tests for schema success/failure and API boundary validation error mapping.
8. Add critical tests for offline banner behavior and disabled network actions.
9. Add critical accessibility tests for roles, labels, and accessibility states on primary controls.
10. Add targeted tests for stale/retry/manual-action behavior only where current coverage has clear MVP risk gaps.
11. Perform focused security review and fix only blocking MVP issues.
12. Perform focused performance review and fix only obvious demo-stability issues.
13. Create `specs/mobile_phase_7_hardening_checklist.spec.md` during implementation with checklist results, fixes, and deferrals.
14. Run verification commands and perform local/staging demo validation.

## Tests and Verification

Automated test scope is critical gaps only:
- Schema validation success for representative valid responses for each endpoint.
- Schema validation failure for missing/wrong required fields, with extra fields accepted.
- API boundary maps malformed responses to sanitized friendly API errors.
- Offline banner renders from NetInfo state and key network actions expose disabled/guarded behavior.
- Primary controls expose meaningful accessibility labels/roles/states.
- Stale/retry/manual-action behavior is covered only where existing tests do not already protect the MVP path.

Manual verification:
- Local mock API validation for valid, malformed, unauthorized, slow, and offline scenarios.
- Local and staging demo checklist for setup, Settings, Dashboard, Channels, Manual actions, and Activity.
- Security checklist: token redaction, no `INTERNAL_API_BEARER_TOKEN` usage, config clear/invalidate cache, external link behavior, and no secret leakage in technical details.
- Performance checklist: Activity/Channels FlatList page size and `onEndReached`, refresh intervals, duplicate request prevention, and manual action disabled/running states.

Commands:
- `npm run typecheck`
- `npm test`

The known Jest worker teardown warning remains non-blocking if all suites pass.

## Acceptance Criteria

- [ ] All mobile endpoint responses are validated at the API boundary before hooks/UI consume DTOs.
- [ ] Validation tolerates extra fields but rejects malformed required fields/types.
- [ ] Validation failures produce friendly, sanitized errors with no token or secret leakage.
- [ ] NetInfo-backed offline/connectivity UX shows a clear banner and disables or guards critical network actions.
- [ ] Critical accessibility tests cover roles, labels, and states for highest-risk controls.
- [ ] Security checklist is completed with fixes or explicit deferrals recorded.
- [ ] Performance checklist is completed with targeted fixes or explicit deferrals recorded.
- [ ] `specs/mobile_phase_7_hardening_checklist.spec.md` is created during implementation with results, fixes, and deferrals.
- [ ] `npm run typecheck` passes.
- [ ] `npm test` passes, allowing only the known non-blocking Jest teardown warning.
- [ ] Local mock API and local/staging demo validation pass for Phase 0-6 critical flows.

## Out of Scope

- Exhaustive per-component test coverage or broad test rewrites.
- Full offline-first sync, queued writes, conflict resolution, or background reconciliation.
- New backend endpoints or backend contract changes unless required for a blocking defect.
- Sentry or external observability/error reporting.
- Major UI redesigns beyond targeted accessibility and hardening fixes.
- Enterprise authentication, device management, audit logging, or managed secrets infrastructure.
- Product code changes as part of this spec-writing task; this document is for later execution.
