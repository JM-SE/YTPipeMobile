# Mobile Pre-Push Cleanup Readiness Implementation Specification

## Context

YTPipeMobile is a React Native/Expo app. The user accepted a pre-push cleanup/readiness plan focused on security/dev readiness, UX/domain consistency, maintainability, and test hardening before push work begins.

## Requirements
- [ ] Enforce HTTPS for real API base URLs; allow HTTP only in `__DEV__` for local dev hosts: `localhost`, `127.0.0.1`, and `10.0.2.2`.
- [ ] Gate `LocalMockHelper` so local mock URLs/tokens are available only in development.
- [ ] Add a YouTube external-link allowlist before `Linking.openURL` in Activity; allow only trusted HTTPS YouTube hosts such as `youtube.com`, `www.youtube.com`, `m.youtube.com`, and `youtu.be`; reject arbitrary schemes/hosts with inline error feedback.
- [ ] Ensure first-enable monitoring education is applied consistently from both Channels list and Channel Detail.
- [ ] Prefer a shared hook/controller for monitoring toggle flow, including offline guard, first-enable education acknowledgement, mutation, rollback, and error state.
- [ ] Add a shared auth/config error banner with direct Open Settings action for `ApiError.kind === 'auth'` in key surfaces: Dashboard, Channels, and Activity where applicable.
- [ ] Centralize query keys, page-size constants, and query predicates in `src/api/queryKeys.ts`; reconcile 25 vs 50 defaults; ensure tokens are never included in query keys.
- [ ] Reduce/remove `config!` in API hooks/mutations through explicit config guards and friendly `ApiError(kind: validation)` failures.
- [ ] Add semantic theme tokens for repeated warning/success/danger/backdrop surfaces and replace repeated hard-coded colors where practical.
- [ ] Rename seed-era identifiers: `package.json.name` to `ytpipe-mobile`, `app.json.expo.name` to `YTPipe Mobile`, and `app.json.expo.slug` to `ytpipe-mobile`.
- [ ] Add lightweight test utilities for QueryClient, providers, and navigation mocks where useful.
- [ ] Add or adjust tests for URL validation dev/prod behavior, dev-only `LocalMockHelper`, YouTube allowlist, Channel Detail education/rollback/offline behavior, auth banner navigation, centralized query key invalidation, and API timeout/abort if included.
- [ ] Run `npm run typecheck` and `npm test` after implementation.

## Technical Approach

Implement the cleanup in safe batches, keeping behavior changes small and reviewable. Prefer shared utilities/hooks for duplicated logic and friendly user-facing errors over scattered guards. Security validation should fail closed in production and only permit local HTTP development exceptions in `__DEV__`. Query key centralization must avoid sensitive values and provide stable invalidation helpers/predicates.

## Implementation Steps
1. Add API base URL validation that requires HTTPS for non-local real endpoints and permits HTTP only for allowed local hosts in `__DEV__`.
2. Make `LocalMockHelper` development-only so mock base URLs/tokens cannot be exposed in production builds.
3. Add Activity YouTube URL validation before `Linking.openURL`, allowing only HTTPS trusted YouTube hosts and surfacing inline errors for rejected links.
4. Apply app identifier renames in package/app metadata.
5. Extract or reuse a shared monitoring toggle hook/controller for Channels list and Channel Detail, including offline guard, first-enable education acknowledgement, mutation sequencing, rollback, and error display.
6. Add a shared auth/config error banner component or helper with Open Settings action, and integrate it into Dashboard, Channels, and Activity where applicable for `ApiError.kind === 'auth'`.
7. Centralize query keys, page-size defaults, and invalidation/query predicates in `src/api/queryKeys.ts`; update call sites and ensure no token/config secret is part of any key.
8. Replace unsafe `config!` access in API hooks/mutations with explicit config checks and friendly validation errors.
9. Add semantic theme tokens for repeated warning/success/danger/backdrop surfaces and replace hard-coded colors where practical without broad visual redesign.
10. Add lightweight test utilities for shared providers, QueryClient setup, and navigation mocks.
11. Add or update focused tests covering the accepted readiness fixes.
12. Run `npm run typecheck` and `npm test`; fix only issues directly related to this implementation.

## Acceptance Criteria
- [ ] Production API base URLs cannot use plain HTTP, while `__DEV__` local HTTP hosts remain supported.
- [ ] `LocalMockHelper` cannot expose local mock URLs/tokens outside development.
- [ ] Activity external YouTube links open only for trusted HTTPS YouTube hosts; invalid schemes/hosts are blocked with inline error feedback.
- [ ] First-enable monitoring education works consistently from Channels list and Channel Detail.
- [ ] Monitoring toggle behavior shares one flow/controller or equivalent common logic for offline guard, acknowledgement, mutation, rollback, and errors.
- [ ] Dashboard, Channels, and Activity key surfaces show a shared auth/config error banner with Open Settings action when applicable.
- [ ] Query keys/constants/predicates are centralized, default page sizes are reconciled, and query keys contain no tokens or secrets.
- [ ] API hooks/mutations avoid unsafe `config!` where practical and return friendly validation errors when config is missing.
- [ ] Repeated warning/success/danger/backdrop colors use semantic theme tokens where practical.
- [ ] App metadata reflects `ytpipe-mobile`, `YTPipe Mobile`, and `ytpipe-mobile` as specified.
- [ ] Focused tests cover the readiness changes, and `npm run typecheck` plus `npm test` pass.

## Out of Scope
- Push product/backend contract decisions.
- Push-specific notification copy decisions.
- Unrelated push implementation details.
- Showing Dashboard `EmailSummaryCard`; it remains hidden for now.
- Broad UI redesign, backend changes, or unrelated refactors.

## Suggested Execution Order
1. Batch 1: Security/dev readiness plus app rename.
2. Batch 2: UX/domain consistency.
3. Batch 3: Maintainability cleanup.
4. Batch 4: Tests/hardening and final verification.
