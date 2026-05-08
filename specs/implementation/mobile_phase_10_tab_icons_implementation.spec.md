# Mobile Tab Icons Implementation Specification

## Context

This implementation follows `specs/mobile_tab_icons_design.spec.md`. Phase 3 currently uses a label-only bottom-tab fallback after an observed Metro/module-resolution issue with `@expo/vector-icons`: `Unable to resolve ./vendor/react-native-vector-icons/lib/create-icon-set`.

The current code uses `tabBarIcon: () => null` in `src/navigation/AppTabsNavigator.tsx` as the temporary fallback.

## Requirements

- [ ] First diagnose and try the Expo-standard `@expo/vector-icons` path because it is the managed Expo default.
- [ ] If the prior Metro error reproduces or cannot be fixed reproducibly, document it and fall back to a stable Expo-compatible alternative rather than brittle workarounds.
- [ ] Choose a supported Expo/React Native icon strategy compatible with the Expo managed workflow.
- [ ] Update `AppTabsNavigator` only as needed to wire tab icons through React Navigation.
- [ ] Update only tab icon-related code, dependencies, and tests unless diagnosis requires dependency cleanup.
- [ ] Integrate active/inactive tint through React Navigation `tabBarIcon`.
- [ ] Avoid brittle glyph fallback behavior or hardcoded unsupported icon internals.
- [ ] Remove or avoid any broken dependency state that triggers Metro/module-resolution failures.
- [ ] Validate Android Metro bundling and app startup after dependency changes.
- [ ] Add or update test/smoke coverage so tabs still render and app startup is not broken.
- [ ] Defer iOS validation because the current development environment is Windows/Android Studio; do not block Phase 10 on iOS validation.

## Technical Approach

Investigate `@expo/vector-icons` and Metro resolution first because it is the Expo-standard path for managed apps. If vector icons are used, pin/install the Expo SDK 54-compatible package version and document required cache/reset steps for reproducible setup.

If `@expo/vector-icons` cannot be made stable, select another icon strategy that is supported by the Expo managed workflow and does not require brittle native or Metro workarounds. The selected approach must render canonical Dashboard, Channels, and Activity icons from the design spec and must use React Navigation `tabBarIcon` with active/inactive tint/color handling.

Android local validation is required for Phase 10. If dependency/cache issues are involved, Metro/app startup validation should include a clean cache run such as `npx expo start -c`. iOS validation is deferred and must be documented as non-blocking for Phase 10 due to the Windows/Android Studio development environment.

## Implementation Result

- Selected the Expo-standard `@expo/vector-icons` strategy for Expo SDK 54.
- Installed `@expo/vector-icons` through `npx expo install @expo/vector-icons`.
- Replaced the temporary label-only `tabBarIcon: () => null` fallback in `src/navigation/AppTabsNavigator.tsx` with Ionicons-based tab icons.
- Android bundling validation passed via `npx expo export --platform android --clear`; the generated bundle included the Ionicons font asset and did not reproduce the prior `create-icon-set` Metro resolution failure.
- iOS validation remains deferred and non-blocking because the current implementation environment is Windows/Android Studio.

## Implementation Steps

1. Reproduce the current `@expo/vector-icons` / Metro resolution error from a clean dependency install or document that it no longer reproduces.
2. Verify Expo SDK 54 compatibility for the chosen icon package and installation method.
3. Install or repair dependencies in a reproducible way and document any cache/reset steps required for Metro.
4. Update `AppTabsNavigator` to replace `tabBarIcon: () => null` with `tabBarIcon` entries for Dashboard, Channels, and Activity only as needed.
5. Map icon names to the design-approved meanings: Dashboard speedometer/status, Channels list/catalog, Activity clock/history.
6. Ensure active and inactive colors are provided by React Navigation tab tint state rather than ad hoc fallback styling.
7. Run Android Metro bundling validation and app startup smoke validation, using `npx expo start -c` if dependency/cache cleanup is part of the fix.
8. Add or update component/smoke coverage confirming tabs still render and app startup is not broken.
9. Document iOS validation as deferred and non-blocking for Phase 10.

## Out of Scope

- Changing navigation shape.
- Adding Expo Router.
- Changing tab names.
- Broad design system adoption.

## Acceptance Criteria

- [ ] The temporary label-only fallback is replaced by stable tab icons.
- [ ] The selected icon dependency strategy is compatible with Expo SDK 54 and documented.
- [ ] Metro bundling succeeds without the prior `create-icon-set` resolution failure.
- [ ] Dashboard, Channels, and Activity each render the design-approved icon: Dashboard speedometer/status, Channels list/catalog, Activity clock/history.
- [ ] Active/inactive tint states are integrated through React Navigation `tabBarIcon`.
- [ ] No brittle glyph fallback or unsupported internal icon dependency is used.
- [ ] Test/smoke coverage confirms tabs still render and app startup is not broken.
- [ ] Android local Metro/app startup validation is completed.
- [ ] iOS validation is documented as deferred and is not a blocking Phase 10 acceptance criterion.
