import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../theme/tokens';

type Props = {
  label: string;
  value: string;
};

export function ActivityDetailRow({ label, value }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || 'Unavailable'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  value: {
    color: colors.textPrimary,
    fontSize: typography.caption,
  },
});
