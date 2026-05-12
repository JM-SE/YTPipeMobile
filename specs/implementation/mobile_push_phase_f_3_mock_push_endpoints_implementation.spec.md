# Mobile Push Phase F.3 Mock Push Endpoints Implementation Specification

## Context

The current repo mock API validates baseline app behavior but does not support push Settings/channel flows. Pressing `Set push notifications` against the mock API returns `requested resource was not found (404)` because `/internal/mobile-push/*` endpoints are missing.

This phase adds local-only mock endpoint support so the mobile app can validate push UI/backend handoff flows after native token retrieval succeeds. Real notification delivery remains out of scope.

## Requirements
- [ ] Add local mock support for the backend handoff mobile push endpoints needed by existing mobile code.
- [ ] Keep mock push behavior clearly local/development only.
- [ ] Do not add real push sending or Firebase credentials to the mock API.
- [ ] Support enough stateful behavior to validate Settings registration, status, global enable/test action, unregister, and channel preference UI without 404 responses.
- [ ] Preserve existing mock baseline endpoints and tests.
- [ ] Test notification endpoint returns a successful mock response but explicitly does not send a real remote push.

## Technical Approach

1. Inspect the existing mobile push contract during implementation before defining endpoint shapes:
   - `specs/mobile_push_rn_handoff.spec.md`, if present.
   - Existing mobile API client/types, especially `src/api/mobilePushApi.ts`.
   - Existing validation schemas used by the mobile app.
2. Mirror exact methods, paths, request bodies, response bodies, and error shapes expected by the current mobile code and Zod schemas.
3. Expected endpoint family likely includes:
   - `/internal/mobile-push/status`
   - register installation
   - unregister installation
   - patch global settings
   - send test notification
   - channel preferences
   - patch channel preference
4. Do not guess final endpoint shapes without reading the contract/code listed above.
5. Add in-memory mock state keyed by installation id and/or channel id as appropriate.
6. Return deterministic responses that satisfy current schemas and allow repeated local manual validation.
7. Add tests for mock endpoint behavior if the mock server has an existing test structure; otherwise document minimal manual checks.

## Implementation Steps
1. Read the mobile push handoff spec, API client, and validation schemas to identify the exact endpoint contract.
2. Extend `tools/mock-mobile-api` with the required `/internal/mobile-push/*` routes.
3. Add local in-memory state for installation registration, global settings/status, test notification response, and channel preferences.
4. Ensure every mock response satisfies current mobile validation schemas.
5. Ensure test notification responses clearly indicate mock success and no real delivery.
6. Preserve existing mock API behavior for non-push endpoints.
7. Add or document verification coverage for registration, status, test, unregister, and channel preference flows.

## Verification
- [ ] Run typecheck and applicable tests after implementation.
- [ ] Start the mock API with `npm run mock:api`.
- [ ] Configure the app base URL to `http://10.0.2.2:4000` for Android emulator validation.
- [ ] After Phase F.2 native Firebase/FCM config is complete, run the Android development build and open Settings.
- [ ] Press `Set push notifications` and verify the flow no longer fails with a mock API 404 after native token retrieval succeeds.
- [ ] Verify push status diagnostics render from mock data.
- [ ] Exercise global enable, test action, unregister, and channel preference flows.
- [ ] Document that real notification delivery and tap handling still require a push-capable backend/provider.

## Acceptance Criteria
- [ ] With `npm run mock:api` and app base URL `http://10.0.2.2:4000`, Settings push setup no longer fails with 404 after native token retrieval succeeds.
- [ ] Push status diagnostics render from mock data.
- [ ] Global enable/test action/channel preference flows can be exercised locally and produce deterministic mock responses.
- [ ] Test notification action clearly communicates mock success/no real push delivery if applicable.
- [ ] Existing app tests pass.

## Out of Scope
- Firebase/FCM config.
- Real Expo push delivery.
- Production backend implementation.
- EAS build pipeline setup.
