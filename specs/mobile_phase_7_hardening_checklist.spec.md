# Mobile Phase 7 Hardening Checklist

## Purpose

Record Phase 7 MVP hardening checks, fixes, and accepted deferrals for YTPipeMobile.

## Runtime Validation

- [x] Added lenient Zod response schemas for all MVP mobile API responses.
- [x] Validated endpoint responses at the API boundary before hooks/UI consume DTOs.
- [x] Mapped malformed responses to friendly `ApiError` parse errors.
- [x] Avoided raw response-body dumps in validation technical details.
- [x] Added tests for valid responses, malformed responses, extra-field tolerance, and sanitized technical details.

## Connectivity And Offline UX

- [x] Added NetInfo-backed connectivity state.
- [x] Added a global offline banner in screen shells.
- [x] Disabled or guarded Settings Save/Test while offline.
- [x] Disabled Dashboard manual Sync/Poll while offline.
- [x] Disabled Dashboard refresh controls while offline.
- [x] Disabled Channel monitoring toggles and pagination/refresh while offline.
- [x] Disabled Activity pagination/refresh while offline.
- [x] Preserved navigation and cached/stale data display; no queued writes were added.

## Security Checklist

- [x] API errors sanitize configured mobile token and bearer tokens from details.
- [x] Validation errors do not include raw response bodies or token values.
- [x] Source code no longer displays the internal automation token name in user-facing copy.
- [x] Config clear continues to clear local config and query cache.
- [x] External YouTube links use React Native `Linking` and show inline failure copy.
- [x] Development mock token remains limited to local mock helper/tests.
- [ ] Full local/staging secret-leak review should be repeated before public distribution.

## Accessibility Checklist

- [x] Offline banner uses alert semantics.
- [x] Settings Save/Test and Clear Config expose button roles, labels, and disabled state.
- [x] Dashboard manual actions expose button roles, labels, and disabled state.
- [x] Activity rows, filter tabs, and external link actions expose roles/labels from earlier phases.
- [x] Channel monitoring switches expose labels and disabled state.
- [ ] Manual device accessibility pass with TalkBack/VoiceOver is deferred until MVP device QA.

## Performance Checklist

- [x] Channels and Activity use `FlatList` with fixed page size `25`.
- [x] Channels and Activity guard `onEndReached` against duplicate fetches while a page is loading.
- [x] Offline state guards refresh/pagination requests while disconnected.
- [x] Dashboard status query keeps a moderate 30-second refresh interval.
- [x] Manual actions disable both buttons while either mutation is running.
- [ ] Formal profiler-based performance measurement is deferred; focused code audit found no blocking MVP issue.

## Verification

- [x] `npm run typecheck` passed during implementation.
- [x] `npm test` passed during implementation with the known non-blocking Jest worker teardown warning.
- [ ] Manual validation against local mock API should be completed before commit.
- [ ] Manual validation against staging backend should be completed when staging credentials are available.

## Accepted Deferrals

- Sentry/external observability remains out of scope.
- Full offline-first sync and queued writes remain out of scope.
- Full automated accessibility scanning and visual regression remain out of scope.
- Formal RN profiler/performance tooling remains out of scope for MVP hardening.
