# Mobile Tab Icons Design Specification

## Context

Phase 3 currently uses label-only bottom tabs for stability after an observed Metro/module-resolution issue with `@expo/vector-icons`: `Unable to resolve ./vendor/react-native-vector-icons/lib/create-icon-set`.

The current MVP decision is that label-only tabs are an acceptable temporary fallback for the Phase 3 commit, but this must not become the long-term design state.

## Requirements

- [ ] Improve bottom tabs with professional, enterprise-quality React Native iconography without destabilizing bundling.
- [ ] Keep Dashboard, Channels, and Activity tab names and navigation shape unchanged.
- [ ] Define canonical icon meanings:
  - Dashboard: operational/status/speedometer.
  - Channels: list/catalog.
  - Activity: history/clock.
- [ ] Support active and inactive color states that align with the app theme.
- [ ] Provide accessible labels for each tab/icon state.
- [ ] Maintain consistent icon size, alignment, and spacing across all tabs.
- [ ] Validate final icon appearance and behavior on Android and iOS.

## Technical Approach

The design should describe tab icons as semantic navigation affordances rather than decorative glyphs. Icons should reinforce existing tab labels, remain readable at mobile tab-bar sizes, and degrade only to the current label-only fallback if a bundling-safe implementation is not available.

## Implementation Steps

1. Confirm the canonical icon meaning for Dashboard, Channels, and Activity.
2. Select icon names from the implementation-approved icon strategy.
3. Define active/inactive colors, size, alignment, and accessibility label expectations.
4. Review Android and iOS screenshots or emulator/device output for visual consistency.
5. Approve the icon treatment for replacement of the temporary label-only fallback.

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
- [ ] Android and iOS validation is completed before design closure.
- [ ] The label-only Phase 3 fallback is explicitly treated as temporary, not final design.
