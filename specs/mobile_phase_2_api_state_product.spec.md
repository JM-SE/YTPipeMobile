# Mobile Phase 2 API State Product Specification

## Phase

Mobile Phase 2: API client and server-state layer, following the existing mobile phase index.

## Product Goal

Provide a reliable, user-visible foundation for authenticated mobile API access and server-state behavior so later mobile features can load backend data consistently, recover from failures, and explain connection problems without disrupting the current screen.

## Product Decisions

- Phase 2 includes a simple visible API/connection diagnostic, not a debug-heavy screen.
- Backend, network, and timeout failures should show a clear message and manual retry while preserving the user's current screen.
- Auto-refresh should be moderate: status may refresh on an interval; other data lists should remain manual or be defined per screen in later phases.
- If previous data exists and a refresh fails, stale data remains visible with a warning that refresh failed.
- Friendly error messages are shown by default, with an option to reveal technical details such as status code or raw diagnostic detail for learning/debugging.
- Retry behavior should be conservative: low retries for network and 5xx failures; no retry for 401, 404, 422, or client validation errors.
- Response validation in Phase 2 should use TypeScript DTO types first; Zod response validation is deferred to hardening unless a later phase identifies a critical need.
- When the active configuration changes, server-state cache must be cleared or invalidated so data reloads under the new configuration.
- A later implementation specification will define client functions, query keys, providers, and error classes.

## API State UX Principles

- API state must support clear loading, success, empty, stale, and error states.
- Users should not lose context because of transient connection failures.
- Auth-related failures should direct users toward Settings without deleting or overwriting their saved configuration automatically.
- Status and diagnostic information should be understandable to non-developers while still allowing technical detail to be revealed intentionally.

## Connection Diagnostic

- Provide a small connection/status surface accessible from Settings or the Dashboard/app shell.
- The diagnostic should show whether the app can reach the configured backend and authenticate successfully.
- The diagnostic should include a manual retry action.
- The diagnostic may auto-refresh status on a moderate interval when visible or relevant.
- The diagnostic should avoid becoming a full debug console in Phase 2.

## Error UX

- Network, backend unavailable, timeout, and server errors must use friendly language and offer manual retry.
- 401 errors must show an authentication/configuration message with a clear path to Settings.
- 404 and 422/client validation errors should not be retried automatically and should show actionable context where possible.
- Technical details should be hidden by default behind a reveal action.
- Error displays should preserve the current screen and avoid navigation resets unless the user chooses to go to Settings.

## Refresh And Cache Behavior

- Status may auto-refresh on a moderate interval.
- Non-status server data should refresh manually or according to later screen-specific product specs.
- If a refresh succeeds, visible data should update normally.
- If a refresh fails and cached data exists, keep showing stale data with a visible refresh-failed warning and retry option.
- If no cached data exists, show an error state with a retry option.
- Server-state behavior should be predictable across app foregrounding, screen focus, and manual retry, with exact policies left to implementation specification.

## Configuration Change Behavior

- Changing the active `apiBaseUrl` or `mobileApiToken` must clear or invalidate server-state cache.
- Data loaded under one configuration must not remain silently visible as current data after switching to another configuration.
- After a successful configuration change, subsequent API state should reload using the new active configuration.

## Security Requirements

- Protected backend requests must use `Authorization: Bearer <MOBILE_API_BEARER_TOKEN>`.
- The mobile app must never use `INTERNAL_API_BEARER_TOKEN`.
- API diagnostics must not display full bearer tokens.
- Friendly and technical error details must avoid exposing secrets.
- Phase 2 must respect Phase 1 configuration behavior: no automatic deletion of config, and Settings remains the place to update `apiBaseUrl` and `mobileApiToken`.

## Out Of Scope

- Full debug console or request inspector.
- Zod response validation unless later deemed critical.
- Product-specific list refresh rules for future screens.
- Offline-first sync, background sync, or conflict resolution.
- Changes to Phase 1 setup, Settings field names, or Save/Test activation rules.
- Implementation-specific files, hooks, query keys, providers, client functions, or error class definitions.

## Product Acceptance Criteria

- [ ] Users can see a simple connection/API diagnostic from Settings or the Dashboard/app shell.
- [ ] Diagnostic status communicates reachability and authentication success or failure.
- [ ] Diagnostic status offers manual retry.
- [ ] Network/backend/down failures show a friendly message and preserve the current screen.
- [ ] Errors provide an option to reveal technical detail/status without showing it by default.
- [ ] 401 errors direct the user to Settings and do not automatically delete configuration.
- [ ] Retry behavior is conservative and does not retry 401, 404, 422, or client validation errors.
- [ ] Status can auto-refresh moderately; other server data does not require broad automatic refresh in Phase 2.
- [ ] Stale cached data remains visible after refresh failure with a clear warning and retry option.
- [ ] Active configuration changes clear or invalidate server-state cache before data reloads under the new configuration.
- [ ] Protected requests use the mobile bearer token only and never use the internal bearer token.

## Open Questions For Later Phases

- Which future screens need automatic refresh versus manual refresh only?
- Which endpoints, if any, require runtime response validation during hardening?
- What exact stale-data wording and visual treatment should be standardized across screens?
- Should diagnostics eventually include backend version/build information if exposed safely?
