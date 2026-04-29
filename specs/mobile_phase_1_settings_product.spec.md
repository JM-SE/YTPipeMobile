# Mobile Phase 1 Settings Product Specification

## Phase

Mobile Phase 1: Settings and secure configuration.

## Product Goal

Allow a mobile user to configure the backend connection securely before using protected app features. The app should only activate a configuration after confirming the base URL and mobile token work against the backend authenticated `/status` endpoint.

## Product Decisions

- Settings contains only two editable fields:
  - `apiBaseUrl`
  - `mobileApiToken`
- The mobile app uses `apiBaseUrl` for backend requests.
- Protected requests send `Authorization: Bearer <MOBILE_API_BEARER_TOKEN>`.
- The mobile app must never use `INTERNAL_API_BEARER_TOKEN`.
- `mobileApiToken` is hidden by default, editable, and has a show/hide toggle.
- Settings is not a primary bottom tab by default.
- After setup, Settings is reachable through a header action, likely from Dashboard or the app shell.
- Environment presets are not part of Phase 1; there is one editable `apiBaseUrl` field.

## Settings Screen Behavior

- If first launch has no active configuration, the user sees the Phase 0 Welcome/setup path before entering the main app.
- Settings presents clear labels and helper text for `apiBaseUrl` and `mobileApiToken`.
- `apiBaseUrl` validation accepts both HTTP and HTTPS URLs, including local development URLs such as `localhost` and `127.0.0.1`.
- The only test action exposed in Settings is the authenticated `/status` test.
- Settings does not expose a separate `/health` test button.

## Save And Test Flow

- The primary Settings action is Save and Test.
- Save and Test first performs local validation of `apiBaseUrl` and `mobileApiToken`.
- If local validation fails, the configuration is not saved as active and the user sees field-level guidance.
- If local validation passes, the app calls authenticated `/status` using the entered base URL and token.
- Configuration is considered saved and active only when authenticated `/status` responds correctly.
- A successful `/status` result may also provide environment and readiness feedback after save.
- If the `/status` test fails, the configuration is not saved as active.
- Failed tests should explain that the backend may be unavailable, sleeping, degraded, or that the token/base URL may be wrong, including Render/staging sleeping or degraded risk.

## Error UX

- Protected endpoint `401` responses show a clear authentication/configuration error.
- A `401` error provides a visible link or action to open Settings.
- A `401` error must not automatically delete the existing configuration.
- Network and backend availability errors distinguish likely connectivity/backend availability from invalid local input where possible.

## Navigation And Access

- Main app navigation continues to use bottom tabs from Phase 0.
- Settings is accessed through a header action rather than being a default primary tab.
- The Settings entry point should be easy to find from Dashboard or the app shell.
- Error states that require configuration repair should offer a direct path to Settings.

## Security Requirements

- `mobileApiToken` is masked by default in the UI.
- The user can temporarily reveal or hide `mobileApiToken` while editing.
- The mobile app only uses the mobile bearer token contract for protected backend calls.
- The mobile app must never request, store, display, or send `INTERNAL_API_BEARER_TOKEN`.
- Active configuration must not be updated until Save and Test succeeds.

## Out Of Scope

- Environment preset selector.
- Multiple saved backend profiles.
- Separate unauthenticated `/health` test button.
- Making Settings a default bottom tab.
- Automatic config deletion on authentication failure.
- Any use of internal backend tokens by the mobile app.

## Product Acceptance Criteria

- [ ] A user can enter only `apiBaseUrl` and `mobileApiToken` on the Settings screen.
- [ ] `mobileApiToken` is hidden by default, editable, and can be shown or hidden with a toggle.
- [ ] Save and Test rejects invalid local input without activating the configuration.
- [ ] Save and Test calls authenticated `/status` and activates configuration only after a correct response.
- [ ] A failed `/status` test does not activate the configuration and explains possible backend availability, sleeping/degraded, token, or base URL causes.
- [ ] Successful save can display environment or readiness feedback from `/status`.
- [ ] Protected endpoint `401` responses show a clear error with an action to open Settings.
- [ ] Protected endpoint `401` responses do not automatically delete existing configuration.
- [ ] HTTP, HTTPS, localhost, and `127.0.0.1` base URLs are acceptable when otherwise valid.
- [ ] Settings is accessible after setup through a header/app-shell action and is not a default primary bottom tab.
- [ ] The mobile app never uses `INTERNAL_API_BEARER_TOKEN`.

## Open Questions For Later Phases

- Should Settings become a primary navigation destination if configuration errors are frequent?
- Should future phases support environment presets or multiple saved backend profiles?
- Should future phases show richer backend readiness details from `/status`?
- Should future phases include token rotation or re-authentication guidance?
