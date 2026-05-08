import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../theme/tokens';

type Props = PropsWithChildren<{
  title: string;
  warning?: boolean;
}>;

export function DashboardCard({ title, warning = false, children }: Props) {
  return (
    <View style={[styles.card, warning ? styles.warningCard : null]}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

export const dashboardCardStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  value: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  info: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
});

const styles = StyleSheet.create({
  card: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  warningCard: {
    borderColor: colors.warning,
    backgroundColor: colors.warningSurface,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: typography.body,
  },
});
