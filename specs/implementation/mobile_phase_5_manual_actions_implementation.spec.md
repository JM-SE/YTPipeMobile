# Mobile Phase 5 Manual Actions Implementation Specification

## Context

Product source: `specs/mobile_phase_5_manual_actions_product.spec.md`.

Current implementation evidence:

- `src/components/dashboard/DashboardQuickActionsCard.tsx` renders disabled Dashboard quick-action placeholders.
- `src/screens/DashboardScreen.tsx` renders the quick-actions card after Dashboard status cards.
- `src/api/mobileApi.ts` already exposes `syncSubscriptions(config)` for `POST /internal/subscriptions/sync` and `runPoll(config)` for `POST /internal/run-poll`.
- `src/api/types.ts` already includes `SyncResult` and `PollResult` DTOs.
- `src/api/queryKeys.ts` includes `status`, `channels`, and `activity`; Phase 4 also introduced infinite channels query keys starting with `['channels', ...]`.
- Existing patterns to follow include `useStatusQuery`, `useUpdateChannelMonitoringMutation`, `ChannelErrorBanner`, and Dashboard card components.

## Requirements

- [ ] Replace disabled quick-action placeholders with executable Dashboard Manual actions for Sync subscriptions and Run poll.
- [ ] Show all action feedback inline inside the Dashboard Manual actions card; do not use toast, modal, navigation, or a standalone Actions tab.
- [ ] While either action is running, disable both action buttons and show clear in-card running feedback.
- [ ] Sync success shows a compact summary using `status` and available import/create/update counts.
- [ ] Poll success shows a compact summary using `run_outcome`, processed/failed counts, baselines, new videos, and `quota_blocked` when applicable.
- [ ] If `quota_blocked=true`, show a prominent persistent inline quota/safety alert until the next manual-action result or refresh.
- [ ] Sync completion invalidates/refetches status and all channels queries.
- [ ] Poll completion invalidates/refetches status, all channels queries, and all activity queries.
- [ ] Friendly errors follow existing `ApiError`/Phase 2 patterns, hide technical details by default, and never leak secrets.
- [ ] 409/OAuth/prerequisite sync errors use specific copy that backend Google OAuth authorization may need completion; do not imply the mobile token is necessarily wrong.
- [ ] Add focused hook and card tests for mutations, invalidation, loading/disabled states, success/error feedback, and quota feedback.

## Technical Approach

Add manual-action mutation hooks using the existing active API config pattern:

- Preferred module: `src/api/useManualActionsMutations.ts`, exporting `useSyncSubscriptionsMutation` and `useRunPollMutation`; separate files are acceptable if consistent with project style.
- Hooks call existing `syncSubscriptions(config)` and `runPoll(config)` only when active config is available.
- Query/mutation keys must not include bearer tokens or secrets.
- Use conservative retry behavior; do not automatically retry quota-blocked or prerequisite-style failures.

Cache invalidation rules:

- Sync success/settle invalidates `queryKeys.status(baseUrl)`.
- Sync success/settle invalidates every channels query by predicate: `query.queryKey[0] === 'channels'`.
- Poll success/settle invalidates `queryKeys.status(baseUrl)`.
- Poll success/settle invalidates every channels query by predicate: `query.queryKey[0] === 'channels'`.
- Poll success/settle invalidates every activity query by predicate: `query.queryKey[0] === 'activity'`.
- Do not rely only on legacy offset-key helpers because Phase 4 infinite channel keys also begin with `['channels', ...]`.

Update `DashboardQuickActionsCard.tsx` to become the Manual actions card:

- Render two `Pressable` buttons with accessible labels for Sync subscriptions and Run poll.
- Disable both buttons while either mutation is pending; visually communicate disabled/running state.
- Render compact educational copy inside the card:
  - Sync imports or updates the subscription catalog only; it does not enable monitoring, baseline all channels, or send notifications; backend Google OAuth authorization may be required.
  - Poll checks monitored channels only, may create baselines for monitored channels without baselines, may detect new videos only for monitored workflows, and may consume quota.
- Render inline status/result/error/alert views within the card.
- Keep technical details hidden by default if surfaced via an expandable/details pattern already used elsewhere.

Result formatting may live in a small helper such as `src/components/dashboard/manualActionMessages.ts` if it keeps the card simple:

- Sync message: include `status`; append `channels_imported`, `channels_created`, and `channels_updated` only when present.
- Poll message: include `run_outcome`, `channels_processed`, `channels_failed`, `baselines_established`, `new_videos_detected`; include quota-blocked language when `quota_blocked=true`.
- Quota alert copy must discourage aggressive retries and explain polling may be temporarily blocked for quota or safety reasons.

Error handling:

- Use existing `ApiError` shape and helpers where available.
- Special-case sync errors when HTTP status is `409` or when error `kind`, message, or detail indicates OAuth/prerequisite/authorization setup; copy should say backend Google OAuth authorization may need to be completed.
- Authentication/authorization failures should still guide users toward valid mobile/admin access or Settings where appropriate.
- Do not display bearer tokens, authorization headers, backend secrets, Google OAuth secrets, or raw sensitive payloads.

## Implementation Steps

1. Review the Phase 5 product spec and existing Dashboard/query/mutation/error-banner patterns.
2. Add manual-action mutation hooks wrapping `syncSubscriptions(config)` and `runPoll(config)` with active-config gating and no token-bearing keys.
3. Implement cache invalidation exactly as specified: status by `queryKeys.status(baseUrl)`, channels by `query.queryKey[0] === 'channels'`, and activity by `query.queryKey[0] === 'activity'` after Poll.
4. Convert `DashboardQuickActionsCard.tsx` from disabled placeholders to executable Manual actions with `Pressable` buttons, shared running lock, accessible labels, and inline feedback areas.
5. Add compact result/error/quota message formatting inline or in a small dashboard helper module.
6. Ensure quota-blocked Poll results render a prominent persistent inline alert until the next action result or refresh replaces it.
7. Add or update hook tests for mutation calls, config gating, invalidation predicates, and no-token key behavior.
8. Add or update card tests for disabled/running states, Sync success summary, Poll success summary, OAuth/prerequisite error copy, generic error copy, and quota alert behavior.
9. Verify with `npm run typecheck`, `npm test`, and manual validation against the mock API.

## Acceptance Criteria

- [ ] Dashboard Manual actions card exposes enabled Sync subscriptions and Run poll actions when API config is available.
- [ ] Tapping either action starts the request immediately with no confirmation dialog.
- [ ] While either request is pending, both actions are disabled and the active operation is clearly indicated.
- [ ] Feedback appears inline inside the Manual actions card only.
- [ ] Sync success displays compact status/count summary using available `SyncResult` fields.
- [ ] Poll success displays compact outcome/count summary using available `PollResult` fields.
- [ ] `quota_blocked=true` displays a prominent in-card quota/safety alert that discourages rapid retries and persists until the next result/refresh.
- [ ] Sync invalidates/refetches status and all channels queries, including infinite Phase 4 channel queries.
- [ ] Poll invalidates/refetches status, all channels queries, and all activity queries.
- [ ] 409/OAuth/prerequisite Sync errors mention backend Google OAuth authorization may need completion and do not blame the mobile token by default.
- [ ] Generic errors use friendly copy with hidden-by-default technical detail when available.
- [ ] No UI, query key, error detail, or log exposes tokens or secrets.
- [ ] Tests cover hooks, invalidation, loading/disabled states, success/error feedback, and quota feedback.
- [ ] `npm run typecheck` passes.
- [ ] `npm test` passes.
- [ ] Manual validation works against mock API using `npm run mock:api` and app configuration `http://10.0.2.2:4000` with `dev-mobile-token`.

## Out of Scope

- Standalone Actions tab or separate manual-actions navigation destination.
- Toasts, modals, confirmation dialogs, detailed result screens, run history, or automatic navigation after actions.
- Automatic retries, especially after quota-blocked responses.
- New backend endpoints, push notification changes, backend Google OAuth implementation, or any non-mobile API contract changes.
- Additional manual actions beyond Sync subscriptions and Run poll.
