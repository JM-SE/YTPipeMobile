import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useConfigStatus } from '../config/ConfigStatusContext';
import { ScreenShell } from '../components/ScreenShell';
import { colors, spacing, typography } from '../theme/tokens';

export function SettingsScreen() {
  const { markMissing, markPresent } = useConfigStatus();

  return (
    <ScreenShell
      title="Settings (Phase 1 placeholder)"
      subtitle="Phase 0 placeholder only. Real save/test + secure storage arrives in Phase 1."
    >
      <View style={styles.card}>
        <Text style={styles.label}>apiBaseUrl</Text>
        <Text style={styles.value}>Placeholder only</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>mobileApiToken</Text>
        <Text style={styles.value}>Placeholder only</Text>
      </View>

      <Pressable style={styles.primaryButton} onPress={markPresent}>
        <Text style={styles.primaryButtonText}>Temporary dev: Mark config present</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={markMissing}>
        <Text style={styles.secondaryButtonText}>Mark config missing</Text>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  value: {
    color: colors.textPrimary,
    fontSize: typography.body,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  primaryButtonText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  secondaryButton: {
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  secondaryButtonText: {
    color: colors.textSecondary,
  },
});
