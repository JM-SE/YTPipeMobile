import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ApiError } from '../../api/errors';
import { colors, spacing, typography } from '../../theme/tokens';

type Props = {
  error: ApiError | null;
  onDismiss?: () => void;
};

export function ChannelErrorBanner({ error, onDismiss }: Props) {
  const [showDetails, setShowDetails] = useState(false);

  if (!error) return null;

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.title}>Channel request failed</Text>
      <Text style={styles.message}>{error.message}</Text>
      {showDetails && (error.detail || error.technical) ? (
        <Text style={styles.details}>{error.detail ?? error.technical}</Text>
      ) : null}
      <View style={styles.actions}>
        {error.detail || error.technical ? (
          <Pressable onPress={() => setShowDetails((value) => !value)}>
            <Text style={styles.actionText}>{showDetails ? 'Hide details' : 'Show details'}</Text>
          </Pressable>
        ) : null}
        {onDismiss ? (
          <Pressable onPress={onDismiss}>
            <Text style={styles.actionText}>Dismiss</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  title: {
    color: colors.danger,
    fontSize: typography.body,
    fontWeight: '700',
  },
  message: {
    color: colors.textPrimary,
    fontSize: typography.caption,
  },
  details: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  actionText: {
    color: colors.accent,
    fontSize: typography.caption,
    fontWeight: '700',
  },
});
