# Mobile Phase 5 Manual Actions Product Specification

## Phase

Phase 5: Manual actions, as referenced by `specs/mobile_app_phase_index.spec.md`.

## Product Goal

Give mobile/admin users a safe, clear way to manually trigger backend subscription synchronization and polling workflows from the mobile app MVP without implying automatic monitoring, automatic notification, or broad polling behavior.

## Product Decisions

- Manual actions live in a Dashboard section for MVP, not a standalone Actions tab.
- There is no standalone Actions tab in MVP; the Dashboard Manual actions section is the settled MVP location.
- MVP includes only two manual actions: Sync subscriptions and Run poll.
- Actions execute directly when tapped; no confirmation dialog is required.
- Each action must show loading/progress while running and brief result feedback after completion.
- Detailed result screens are not required for MVP.

## Placement And Navigation

- The Dashboard should include a Manual actions area with shortcuts for Sync subscriptions and Run poll.
- Phase 3 Dashboard quick actions/shortcuts become executable in this phase.
- Phase 4 Channels empty states may guide users toward Sync subscriptions or the Dashboard Manual actions area.
- The product must not present manual actions as a separate primary destination in MVP.

## Available Actions

- Sync subscriptions:
  - Calls `POST /internal/subscriptions/sync` through the authenticated mobile/admin flow.
  - Imports or updates the YouTube subscription catalog.
  - Does not enable monitoring automatically.
  - Does not establish polling baselines for every channel.
  - Does not notify users.
  - Requires prior Google OAuth authorization completed in the backend.
- Run poll:
  - Calls `POST /internal/run-poll` through the authenticated mobile/admin flow.
  - Polls explicitly monitored channels only.
  - Establishes baselines only for monitored channels without a baseline.
  - Detects new videos only for monitored channels.
  - Creates video/activity/delivery records only for the monitored-channel workflow.

## Action Execution UX

- Tapping an action button starts the request immediately.
- While any manual action request is running, action buttons must be disabled to prevent repeated submissions.
- The running action should display clear loading/progress feedback.
- The UX should not encourage repeated tapping, rapid retries, or parallel manual actions.

## Result And Feedback UX

- Sync result feedback should be a brief toast/snackbar-style success or error message.
- Poll result feedback should be a brief toast/snackbar-style success or error message.
- Sync responses are implementation-specific but should provide enough summary data to communicate success/failure counts when available.
- Poll result feedback may summarize aggregate fields such as `run_outcome`, `channels_processed`, `channels_failed`, `baselines_established`, and `new_videos_detected` when useful, but must remain brief.
- A detailed result page or persistent run report is out of scope for MVP.

## Quota And Safety UX

- If poll returns `quota_blocked=true`, show a prominent quota/safety-stop alert.
- The alert should discourage aggressive retries and explain that polling may be temporarily blocked for quota or safety reasons.
- The app should not automatically retry aggressively after a quota-blocked response.
- Poll education should make clear that manual polling may consume YouTube/API quota.

## Post-Action Refresh Behavior

- After Sync subscriptions completes, refresh status and channels data.
- After Run poll completes, refresh status, activity, and channels data.
- After Run poll, the user should see updated `/status`, `/internal/channels`, and `/internal/activity` information once refresh completes.

## Education And Warning Copy

- Sync copy should explain that it imports or updates the subscription catalog only.
- Sync copy should explain that it does not automatically enable monitoring, set polling baselines for all channels, or send notifications.
- Sync copy should mention that backend Google OAuth authorization may be required before the action can succeed.
- Poll copy should explain that it checks monitored channels only.
- Poll copy should explain that monitored channels without a baseline may receive a baseline rather than old-video notifications.
- Poll copy should explain that new-video detection and activity/delivery creation apply only to the monitored-channel workflow.
- Poll copy should warn that the action may consume quota.
- Copy must remain consistent with existing monitoring baseline and no-old-video notification semantics.

## Error UX

- Errors should follow Phase 2 behavior: friendly user-facing messages, optional technical details, and conservative retry guidance.
- Authentication or authorization failures should clearly indicate that the user may need valid mobile/admin access.
- Sync OAuth prerequisite failures should clearly indicate that backend Google OAuth authorization may need to be completed.
- Quota-blocked poll failures should use the quota/safety alert treatment rather than generic retry messaging.

## Security Requirements

- Both actions require the protected mobile/admin bearer-token flow.
- The app must not expose admin credentials, backend secrets, or Google OAuth secrets in UI copy, logs, or user-visible technical details.
- Manual actions should be available only to users/session contexts authorized for mobile/admin operations.

## Out Of Scope

- A standalone Actions tab for MVP.
- Additional manual actions beyond Sync subscriptions and Run poll.
- Confirmation dialogs before action execution.
- Detailed result screens, run history, or persistent reports.
- Automatic monitoring enablement after sync.
- Automatic baseline creation for all subscribed channels.
- Notifications from sync alone.
- Aggressive automatic retries after errors or quota blocking.
- Implementation details such as mutation hooks, toast mechanism, and cache invalidation; these belong in an implementation specification.

## Product Acceptance Criteria

- [ ] Dashboard includes a Manual actions section for Sync subscriptions and Run poll.
- [ ] Sync subscriptions executes directly, shows loading, disables repeated actions while running, and returns brief success/error feedback.
- [ ] Run poll executes directly, shows loading, disables repeated actions while running, and returns brief success/error feedback.
- [ ] Sync education makes clear that the action imports catalog data only and does not enable monitoring, create all baselines, or notify.
- [ ] Poll education makes clear that the action checks monitored channels only, may establish baselines for monitored channels, and may consume quota.
- [ ] Sync completion refreshes status and channels.
- [ ] Poll completion refreshes status, activity, and channels.
- [ ] `quota_blocked=true` produces a prominent quota/safety alert and does not encourage aggressive retries.
- [ ] Friendly error messaging follows Phase 2 behavior, with optional technical detail and conservative retries.
- [ ] Manual actions require mobile/admin bearer-token authorization and do not expose secrets.

## Open Questions For Later Phases

- Should a dedicated admin/actions destination be considered after MVP usage is validated?
- Should later versions add detailed action result history or audit logs?
- Should later versions add confirmation dialogs for high-cost or quota-sensitive actions?
- Should manual actions become configurable by user role or environment?
