import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../theme/tokens';
import { DashboardCard } from './DashboardCard';

type Props = {
};

export function DashboardQuickActionsCard({}: Props) {
  return (
    <DashboardCard title="Quick actions">
      <View style={styles.row}>
        <Pressable style={[styles.placeholderButton, styles.disabled]} disabled accessibilityLabel="Sync coming in phase 5">
          <Text style={styles.placeholderText}>Sync (Phase 5)</Text>
        </Pressable>
        <Pressable style={[styles.placeholderButton, styles.disabled]} disabled accessibilityLabel="Poll coming in phase 5">
          <Text style={styles.placeholderText}>Poll (Phase 5)</Text>
        </Pressable>
      </View>
      <Text style={styles.info}>Manual Sync/Poll execution becomes available in Phase 5.</Text>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  placeholderButton: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  disabled: {
    opacity: 0.6,
  },
  placeholderText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  info: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
});
