# Mobile Phase 3 Dashboard Implementation Specification

## Context

Product source: `specs/mobile_phase_3_dashboard_product.spec.md`.

Phase 2 is committed and provides shared `/status` API state:

- `src/api/types.ts` includes `StatusResponse`, `PollResult`, channels, email, quota DTOs.
- `src/api/useStatusQuery.ts` uses TanStack Query with active config, 30 second status refresh, conservative retry, and previous data support.
- `src/components/ConnectionDiagnosticCard.tsx` renders the Phase 2 diagnostic card.
- `src/screens/DashboardScreen.tsx` currently renders `ConnectionDiagnosticCard` and a Phase 5 manual actions placeholder.

Phase 3 implements the Dashboard MVP using only `GET /status`; no backend endpoint or contract changes are needed.

## Requirements

- [ ] Replace the standalone diagnostic card experience with a vertical mobile dashboard of cards sourced from `useStatusQuery`.
- [ ] Merge current `ConnectionDiagnosticCard` behavior into the main Service Readiness card; avoid duplicate diagnostic and readiness cards.
- [ ] Preserve Phase 2 query behavior: use `useStatusQuery`, keep 30 second auto-refresh, preserve previous data on refetch failure, and do not duplicate fetch logic.
- [ ] Support both a visible Refresh button and pull-to-refresh via React Native `RefreshControl`; both call the existing query `refetch`.
- [ ] Show initial loading when no status data exists, success cards when data exists, stale warning plus cards when refetch fails with previous data, and a friendly no-data error card with retry/details when no data exists.
- [ ] Present `ready=false` as degraded/not ready with warning styling while preserving all available dashboard cards.
- [ ] Use relative times through `date-fns` where possible, with safe fallbacks such as `Never`, `Unknown`, or raw/safe text for invalid values.
- [ ] Make quota prominent only when `quota.safety_stop_active`, `polling.last_run.quota_blocked`, or `estimated_units_used_today / daily_quota_budget >= 0.8`.
- [ ] Include disabled Sync/Poll placeholders with copy such as `Coming in Phase 5`; do not execute actions.
- [ ] Use React Native primitives and existing `theme/tokens.ts`; do not add a UI library.
- [ ] Add/adjust component and helper tests under `src/test/`; keep the test scope focused, not exhaustive.

## Technical Approach

Recommended files/modules to create or update:

- Refactor or replace `src/components/ConnectionDiagnosticCard.tsx` so its connection/auth/error-details behavior is represented inside the dashboard `ServiceReadinessCard`.
  - Keeping this file as a compatibility wrapper is acceptable if useful.
  - Do not render both a separate diagnostic card and a readiness card.
- Add `src/components/dashboard/ServiceReadinessCard.tsx` or equivalent.
  - Shows connection/auth status, environment, ready/degraded badge, and expandable hidden technical details when an error exists.
  - 401/auth copy should point users toward Settings when practical and must not clear config automatically.
- Add `src/components/dashboard/PollingSummaryCard.tsx` or equivalent.
  - Shows `last_success_at` relative/fallback, latest outcome, new videos count, and last error presence using `last_error_at`/message when relevant.
  - Do not show detailed `channel_errors` in Phase 3.
- Add `src/components/dashboard/EmailSummaryCard.tsx` or equivalent.
  - Shows delivered, failed, pending, `pending_retry` if present, `last_attempt_at`, and last error when relevant without over-alarming.
- Add `src/components/dashboard/QuotaSummaryCard.tsx` or equivalent.
  - Compact normal state.
  - Prominent warning when safety stop, quota blocked, or >=80% budget usage.
  - Shows percent used only when `daily_quota_budget > 0`; handles zero, missing, or unknown budget safely.
- Add `src/components/dashboard/ChannelSummaryCard.tsx` or equivalent.
  - Shows `imported_count` and `monitored_count` from `/status.channels`.
- Add `src/components/dashboard/DashboardQuickActionsCard.tsx` or equivalent.
  - Active Refresh button.
  - Disabled Sync/Poll buttons with Phase 5 placeholder copy and accessible disabled labels if feasible.
- Add `src/components/dashboard/dashboardFormatters.ts` or `src/utils/dateFormatters.ts`.
  - Helper coverage should include relative/fallback time formatting, readiness/status labels, and quota risk evaluation.
- Update `src/screens/DashboardScreen.tsx`.
  - Use `useStatusQuery` directly.
  - Render a `ScrollView` with `RefreshControl`, vertical mobile cards, manual Refresh, stale/error states, and readable spacing.
  - Use query `data` for cards whenever available, even when `error` is also present after a failed refetch.

UI behavior:

- Initial loading with no data: show a simple loading dashboard state, skeleton, or friendly loading text.
- Success: show all dashboard cards in a vertical `ScrollView`.
- Refetch failure with previous data: keep all cards visible, show a stale warning/banner, and provide retry.
- Error with no data: show a friendly error card with Retry and `Show details` / `Hide details`; for 401, guide the user to Settings if practical.
- `ready=false`: use warning/degraded badge/card style but continue rendering all available summaries.

Styling guidance:

- Use `View`, `Text`, `Pressable`, `ScrollView`, `RefreshControl`, and `StyleSheet`.
- Use existing `theme/tokens.ts` for spacing, colors, typography, and radius where available.
- Keep cards mobile-friendly: readable labels, clear hierarchy, sufficient touch targets, and accessible labels for refresh and disabled actions where feasible.

## Implementation Steps

1. Review `specs/mobile_phase_3_dashboard_product.spec.md`, Phase 2 implementation, and current `/status` DTO field names in `src/api/types.ts`.
2. Add dashboard helper formatters for safe relative times, status/readiness labels, and quota risk calculation.
3. Create dashboard card components for service readiness, polling, email, quota, channels, and quick actions.
4. Refactor or wrap `ConnectionDiagnosticCard` so diagnostic behavior is merged into `ServiceReadinessCard` and no duplicate card appears.
5. Update `DashboardScreen.tsx` to call `useStatusQuery`, render `ScrollView`/`RefreshControl`, wire manual refresh to `refetch`, and handle loading, success, stale-with-data, and no-data error states.
6. Add or adjust focused tests under `src/test/` for helper formatters and dashboard/cards.
7. Update or remove old `ConnectionDiagnosticCard` tests if the component is replaced or reduced to a wrapper.
8. Verify with `npm run typecheck`, `npm test`, and a manual local run with the mock API.

## Acceptance Criteria

- [ ] `DashboardScreen.tsx` uses `useStatusQuery`; no separate query or duplicate `/status` fetch logic is introduced.
- [ ] The dashboard renders vertical mobile cards in a `ScrollView` and supports pull-to-refresh via `RefreshControl`.
- [ ] Manual Refresh is visible, active, calls `refetch`, and shares refreshing state with pull-to-refresh.
- [ ] Initial loading with no data renders a loading dashboard state.
- [ ] Successful `/status` data renders Service Readiness, Polling, Email, Quota, Channel, and Quick Actions cards.
- [ ] Refetch failure with previous data keeps cards visible and shows stale warning/banner plus retry.
- [ ] Error with no data shows friendly copy, retry, and hidden technical details toggle; 401 points to Settings if practical.
- [ ] Service Readiness includes connection/auth status, environment, ready/degraded badge, and merged diagnostic details.
- [ ] `ready=false` appears degraded/not ready without hiding other cards.
- [ ] Polling card shows last success, latest outcome, new videos count, and error presence without detailed channel errors.
- [ ] Email card shows delivered, failed, pending, optional pending retry, last attempt, and relevant last error.
- [ ] Quota card is compact when normal and prominent when safety stop, quota blocked, or usage is >=80% of a positive budget.
- [ ] Quota percent handles zero, missing, or unknown budget without division errors or misleading percentages.
- [ ] Channel card shows imported and monitored counts.
- [ ] Quick Actions card includes active Refresh and disabled Sync/Poll placeholders with Phase 5 copy.
- [ ] Relative time/status/quota helper tests cover fallback, invalid dates, labels, and quota risk threshold.
- [ ] Component tests cover success render, degraded `ready=false`, quota risk, stale warning with previous data, no-data error details toggle, refresh invoking `refetch`, and disabled Sync/Poll placeholders.
- [ ] Old `ConnectionDiagnosticCard` tests are updated or removed to match the merged readiness-card behavior.
- [ ] `npm run typecheck` passes.
- [ ] `npm test` passes.

## Out Of Scope

- Manual Sync/Poll execution or mutations; this remains Phase 5.
- Channels UI beyond summary counts; this remains Phase 4.
- Activity UI; this remains Phase 6.
- New backend endpoints or `/status` contract changes.
- Zod response validation.
- Push notifications, offline-first behavior, or observability work.
- UI library adoption.
