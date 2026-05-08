# Mobile Tab Icons Design Specification

## Context

Phase 3 currently uses label-only bottom tabs for stability after an observed Metro/module-resolution issue with `@expo/vector-icons`: `Unable to resolve ./vendor/react-native-vector-icons/lib/create-icon-set`.

The current MVP decision is that label-only tabs are an acceptable temporary fallback for the Phase 3 commit, but this must not become the long-term design state.

## Requirements

- [ ] Improve bottom tabs with professional, enterprise-quality React Native iconography without destabilizing bundling.
- [ ] Keep Dashboard, Channels, and Activity tab names and navigation shape unchanged.
- [ ] Define canonical icon meanings:
  - Dashboard: speedometer/status.
  - Channels: list/catalog.
  - Activity: clock/history.
- [ ] Support active and inactive color states that align with the app theme.
- [ ] Provide accessible labels for each tab/icon state.
- [ ] Maintain consistent icon size, alignment, and spacing across all tabs.
- [ ] Validate final icon appearance and behavior on Android for Phase 10.
- [ ] Defer and document iOS validation because the current development environment is Windows/Android Studio.

## Technical Approach

The design should describe tab icons as semantic navigation affordances rather than decorative glyphs. Icons should reinforce existing tab labels, remain readable at mobile tab-bar sizes, and degrade only to the current label-only fallback if a bundling-safe implementation is not available.

Implementation should first diagnose and attempt the Expo-standard `@expo/vector-icons` path because it is the managed Expo default. If the prior Metro error reproduces or cannot be fixed reproducibly, document the failure and fall back to a stable Expo-compatible alternative rather than brittle workarounds.

## Implementation Steps

1. Confirm the canonical icon meaning for Dashboard, Channels, and Activity.
2. Select icon names from the implementation-approved icon strategy.
3. Define active/inactive colors, size, alignment, and accessibility label expectations.
4. Review Android emulator/device output for visual consistency in Phase 10.
5. Approve the icon treatment for replacement of the temporary label-only fallback.
6. Document iOS visual validation as deferred until an iOS-capable environment is available.

## Out of Scope

- Changing navigation shape.
- Adding Expo Router.
- Changing tab names.
- Broad design system adoption.

## Acceptance Criteria

- [ ] Dashboard, Channels, and Activity have approved canonical icon meanings.
- [ ] Active and inactive states are specified for all tab icons.
- [ ] Accessibility label expectations are documented.
- [ ] Icon sizing and alignment expectations are documented.
- [ ] Android validation is completed before Phase 10 design closure.
- [ ] iOS validation deferral is explicitly documented and is not blocking for Phase 10.
- [ ] The label-only Phase 3 fallback is explicitly treated as temporary, not final design.
