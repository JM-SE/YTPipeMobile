# Mobile Tab Icons Implementation Specification

## Context

This implementation follows `specs/mobile_tab_icons_design.spec.md`. Phase 3 currently uses a label-only bottom-tab fallback after an observed Metro/module-resolution issue with `@expo/vector-icons`: `Unable to resolve ./vendor/react-native-vector-icons/lib/create-icon-set`.

## Requirements

- [ ] Resolve the icon dependency issue reproducibly before replacing the label-only fallback.
- [ ] Choose a supported Expo/React Native icon strategy compatible with the Expo managed workflow.
- [ ] Update `AppTabsNavigator` only as needed to wire tab icons through React Navigation.
- [ ] Integrate active/inactive tint through React Navigation `tabBarIcon`.
- [ ] Avoid brittle glyph fallback behavior or hardcoded unsupported icon internals.
- [ ] Remove or avoid any broken dependency state that triggers Metro/module-resolution failures.
- [ ] Validate Metro bundling after dependency changes.
- [ ] Add or update test/smoke coverage so tab icons render and do not break app startup.

## Technical Approach

Investigate `@expo/vector-icons` and Metro resolution first because it is the Expo-standard path for managed apps. If vector icons are used, pin/install the Expo SDK 54-compatible package version and document required cache/reset steps for reproducible setup.

If `@expo/vector-icons` cannot be made stable, select another icon strategy that is supported by the Expo managed workflow and does not require brittle native or Metro workarounds. The selected approach must render canonical Dashboard, Channels, and Activity icons from the design spec and must use React Navigation `tabBarIcon` with active/inactive tint handling.

## Implementation Steps

1. Reproduce the current `@expo/vector-icons` / Metro resolution error from a clean dependency install or document that it no longer reproduces.
2. Verify Expo SDK 54 compatibility for the chosen icon package and installation method.
3. Install or repair dependencies in a reproducible way and document any cache/reset steps required for Metro.
4. Update `AppTabsNavigator` to provide `tabBarIcon` entries for Dashboard, Channels, and Activity only as needed.
5. Map icon names to the design-approved meanings: Dashboard operational/status/speedometer, Channels list/catalog, Activity history/clock.
6. Ensure active and inactive colors are provided by React Navigation tab tint state rather than ad hoc fallback styling.
7. Run Metro bundling validation and app startup smoke validation.
8. Add or update component/smoke coverage for tab icon rendering.
9. Validate behavior on Android and iOS before closing the implementation.

## Out of Scope

- Changing navigation shape.
- Adding Expo Router.
- Changing tab names.
- Broad design system adoption.

## Acceptance Criteria

- [ ] The temporary label-only fallback is replaced by stable tab icons.
- [ ] The selected icon dependency strategy is compatible with Expo SDK 54 and documented.
- [ ] Metro bundling succeeds without the prior `create-icon-set` resolution failure.
- [ ] Dashboard, Channels, and Activity each render the design-approved icon.
- [ ] Active/inactive tint states are integrated through React Navigation `tabBarIcon`.
- [ ] No brittle glyph fallback or unsupported internal icon dependency is used.
- [ ] Test/smoke coverage confirms tab icons render and app startup is not broken.
- [ ] Android and iOS validation is completed.
