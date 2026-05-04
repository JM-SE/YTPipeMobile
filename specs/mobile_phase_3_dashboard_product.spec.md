# Mobile Phase 3 Dashboard Product Specification

## Phase

Phase 3: Dashboard MVP, as defined in `specs/mobile_app_phase_index.spec.md`.

## Product Goal

Provide a balanced dashboard for the protected `GET /status` backend contract, prioritizing operational health first and showing activity/channel summaries below without overwhelming the user.

Implementation details, including exact layout, query hook usage, and refresh intervals, will be defined in a later implementation specification.

## Product Decisions

- The dashboard should lead with service readiness, environment, and connection status.
- `ready=false` means degraded/not ready and should be visible without taking over the whole dashboard.
- Available data should remain visible whenever possible, including during degraded states or stale-cache states.
- Polling and email summaries should be separate because `polling.last_run` and email delivery status communicate different user outcomes.
- Staging/demo fake email mode may still show delivered counts and should not be treated as a product error by itself.
- Quota and safety-stop information should be prominent only when there is user risk or operational blocking.
- Quick actions should be present as dashboard affordances, while actual sync/poll action implementation remains Phase 5 scope.

## Dashboard Content

- Service readiness card: ready state, environment, and connection/status result.
- Polling summary: last success, latest outcome, new videos count, and whether an error occurred.
- Email/delivery summary: delivered, failed, pending, and last attempt.
- Quota/safety summary: compact normal state, prominent risk state.
- Channel summary: high-level channel counts from `/status.channels`.
- Quick action area: refresh plus Dashboard Manual actions affordances/placeholders for Sync/Poll that become executable in Phase 5.

## Status And Readiness UX

- The first and most prominent block should be a service readiness card.
- `ready=true` should communicate that the backend is operational for mobile use.
- `ready=false` should show a badge or discreet degraded/not-ready indicator and preserve any available status details.
- Environment should be visible so the user can distinguish local, staging, demo, and production-like contexts.
- Connection state should clearly indicate whether the app successfully reached `/status` with the configured token.

## Polling Summary UX

- Show a simple MVP polling summary with:
  - last successful polling time when available,
  - latest outcome,
  - new videos found,
  - whether there was an error.
- Avoid detailed per-channel error lists in Phase 3 unless later product evidence shows they are needed.
- Polling state should not be confused with email delivery state.

## Email And Delivery Summary UX

- Show delivered, failed, and pending counts.
- Show last email attempt when available.
- Fake email mode in staging/demo can still show delivered counts; the dashboard should not label that as failure by default.
- Failed or pending delivery should be visible but not more prominent than service readiness unless it represents current user action risk.

## Quota UX

- Keep quota compact and non-prominent when usage is normal.
- Make quota/safety status prominent when `safety_stop_active`, `quota_blocked`, or high usage indicates risk.
- Risk messaging should explain that backend activity may be paused or blocked.
- Avoid alarming quota presentation when no risk condition is present.

## Quick Actions

- Include manual refresh as a dashboard action.
- Include non-executable/placeholder Sync and Poll affordances in the Dashboard.
- In Phase 3, Sync/Poll affordances may use navigation-safe placeholders, but they should not route to a separate primary destination.
- Executing sync/poll actions, mutation feedback, and follow-up refresh behavior are Phase 5 scope.

## Refresh And Stale Data Behavior

- Support moderate auto-refresh consistent with Phase 2 state behavior.
- Support pull/manual refresh from the dashboard.
- If `/status` fails but previous data exists, keep stale data visible when appropriate and show a warning.
- Network and 5xx failures should preserve stale data, warn the user, and retry conservatively.
- Configuration changes from Phase 1/2 should clear cached dashboard status so stale data from another backend/token is not shown.

## Error UX

- 401 should show a friendly error with a clear link to Settings and must not auto-delete saved configuration.
- Network and 5xx errors should show friendly copy, preserve stale data when available, and allow manual retry.
- Other errors may show an actionable error state with the option to reveal technical detail.
- Error states should avoid hiding valid previously loaded data unless the error means the data is no longer trustworthy.

## Out Of Scope

- Exact component hierarchy, file names, hooks, and styling implementation.
- Exact auto-refresh interval values.
- Manual sync/poll execution and mutation flows.
- Detailed `channel_errors` presentation.
- Push notifications or background delivery behavior.
- Backend contract changes to `/status`.

## Product Acceptance Criteria

- [ ] Dashboard uses `GET /status` as the source for readiness, polling, email, quota, and channel summaries.
- [ ] The most prominent dashboard block is service readiness with ready state, environment, and connection status.
- [ ] `ready=false` is presented as degraded/not ready without hiding other available data.
- [ ] Polling summary shows last success, outcome, new videos, and error presence.
- [ ] Email summary shows delivered, failed, pending, and last attempt separately from polling.
- [ ] Quota/safety status is compact when normal and prominent when risk/blocking exists.
- [ ] Dashboard includes refresh plus Sync/Poll affordances/placeholders in the Dashboard.
- [ ] Moderate auto-refresh and manual refresh are supported at the product behavior level.
- [ ] Stale previous data remains visible with warning for network/5xx failures.
- [ ] 401 directs the user to Settings and does not auto-delete configuration.

## Open Questions For Later Phases

- What exact thresholds define high quota usage for prominent warning treatment?
- Should detailed channel error summaries be added after channels/monitoring and activity history phases?
- Should a dedicated admin/actions destination be considered after MVP usage is validated?
- How should fake email mode be labeled if staging/demo usage becomes common?
