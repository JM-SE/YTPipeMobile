# Mobile Push Phase F.1 Expo Go / Development Build Compatibility Implementation Specification

## Context

This repo uses Expo SDK 54 (`expo ~54.0.33`, `expo-notifications ~0.32.17`). Starting in Expo SDK 53, Android remote push notification functionality from `expo-notifications` is removed from Expo Go and requires a development build/native build. The current app mounts `PushNotificationHandler` unconditionally from `App.tsx`; that path imports `expo-notifications` via the handler/configuration modules and can trigger the Expo Go Android runtime error on first load.

Goal: allow the app to launch in Android Expo Go without loading the remote push runtime, while preserving existing Phase F notification listener/tap behavior in development builds and native builds.

Because the current `package.json` has no visible `expo-dev-client` dependency or dedicated dev-client script, this phase also establishes a documented Android development-build path for Phase G push validation without replacing the existing Expo Go smoke workflow.

## Requirements

- [ ] Android Expo Go app launch must not show the SDK 53+ `expo-notifications` remote push removed error on first load.
- [ ] Push notification runtime and tap handling remain enabled in development/native builds.
- [ ] Settings push setup clearly tells users/devs that Android Expo Go cannot register/test remote push and requires a development build.
- [ ] Android development-build path is documented/enabled for push validation without replacing Expo Go smoke startup.
- [ ] Avoid broad refactors and preserve existing tests.
- [ ] Do not call `expo-notifications` APIs that trigger remote push behavior when the environment is Android Expo Go.

## Technical Approach

- Add a small runtime capability helper, e.g. `src/notifications/pushRuntimeEnvironment.ts`.
- Prefer detecting Expo Go with `expo-constants` `ExecutionEnvironment.StoreClient`; if the dependency is missing, add it with `expo install expo-constants` or confirm it is already available through Expo SDK 54.
- Expose capability methods such as `isRemotePushRuntimeAvailable()` and `getRemotePushUnavailableReason()`.
  - Android + Expo Go returns unavailable with a reason requiring a development build.
  - Development/native builds return available.
- Avoid static importing the `expo-notifications` runtime from `App.tsx` in Expo Go.
  - Split the current `PushNotificationHandler` if needed into an Expo Go-safe boundary component and a runtime component/module.
  - The boundary imports only the environment helper and conditionally loads the runtime module containing `expo-notifications` imports.
  - A conditional `require` after the Expo Go guard is acceptable if typecheck, lint, and tests pass.
- Keep `configureNotificationHandler` imported only by the runtime module, never by the Expo Go-safe boundary path.
- Add or confirm `expo-dev-client` using an Expo-compatible install if the project does not already include it.
- Provide a clear Android development-build launch path for Phase G:
  - create/install with `npx expo run:android` or equivalent approved development build flow;
  - start Metro for the installed dev client with `npx expo start --dev-client`.
- Optionally add a small npm script for dev-client startup/build only if consistent with existing project conventions; otherwise document the commands in this spec and Phase G.
- Keep EAS pipeline setup out of scope.
- Guard Settings push actions when remote push runtime is unavailable on Android Expo Go:
  - setup/register;
  - permission refresh if it would invoke unsupported remote push APIs;
  - send test notification;
  - push controls/toggles that depend on native remote push registration.
- Use explicit feedback: `Remote push notifications require a development build on Android; Expo Go cannot register or receive remote pushes.`
- Preserve backend status fetching if useful, but disable registration/test/toggles that depend on native remote push when runtime is unavailable.
- Update Jest mocks/tests to cover both the Expo Go unavailable path and the available path.

## Implementation Steps

1. Add the push runtime environment helper and unit tests for Android Expo Go unavailable, Android development/native available, and non-Android behavior.
2. Check whether `expo-dev-client` is already installed/configured; if missing, install it with the Expo-compatible command and keep dependency changes minimal.
3. Document or add consistent launch commands for Android development build validation: `npx expo run:android` and `npx expo start --dev-client`.
4. Refactor the notification handler entry point into a safe boundary plus runtime module so Expo Go Android does not import `expo-notifications` on first load.
5. Keep existing Phase F listener and last-response handling inside the runtime module and verify it still runs when the runtime is available.
6. Guard Settings push controller/actions with the runtime capability helper and return the explicit development-build feedback message for unsupported Android Expo Go actions.
7. Disable or block unsupported Settings push controls while leaving non-push Settings/config behavior and useful backend status fetching intact.
8. Update mocks and focused tests for unavailable and available paths without broad test rewrites.

## Tests

- Unit test `pushRuntimeEnvironment` capability detection and unavailable reason.
- Component/controller test the `PushNotificationHandler` boundary unavailable path to confirm no notification runtime/listener/token APIs are invoked.
- Regression test the available path to confirm existing Phase F listener registration and last response handling still occur.
- Settings controller tests for disabled/blocked setup, registration, permission refresh, test send, and feedback behavior in Android Expo Go.
- Existing Settings and notification tests continue to pass.

## Verification

1. `npm run typecheck`
2. Focused notification and Settings tests.
3. `npm test`
4. Manual Android Expo Go smoke launch with `npm run android` or `npx expo start --android`; verify no first-load `expo-notifications` remote push removed error and push runtime is disabled.
5. Manual Android development build install/start smoke: create/install with `npx expo run:android` or approved equivalent, then start with `npx expo start --dev-client`.
6. Manual Android development/native build launch; verify notification listeners and tap handling initialize before full push testing.

## Acceptance Criteria

- [ ] Expo Go Android can launch the app without the SDK 53+ `expo-notifications` remote push error.
- [ ] In Expo Go Android, notification handler/listener and token registration APIs are not invoked.
- [ ] In development/native builds, existing Phase F notification handling still registers listeners and handles last responses.
- [ ] Settings communicates the development-build requirement and disables/blocks unsupported push actions in Expo Go Android.
- [ ] Android development-build path can be started or is clearly documented for Phase G manual validation.
- [ ] `npm run typecheck` and tests pass.

## Out of Scope

- Building an EAS pipeline.
- Implementing backend `/internal/mobile-push/*` endpoints.
- Fixing Phase G manual validation defects.
