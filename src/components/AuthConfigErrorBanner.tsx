import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ApiError } from '../api/errors';
import { colors, spacing, typography } from '../theme/tokens';

type Props = {
  error: ApiError | null | undefined;
  onOpenSettings: () => void;
};

export function AuthConfigErrorBanner({ error, onOpenSettings }: Props) {
  if (error?.kind !== 'auth') return null;

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.title}>Mobile API access failed</Text>
      <Text style={styles.message}>Check your API base URL and mobile token in Settings.</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open Settings"
        onPress={onOpenSettings}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Open Settings</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.dangerSurface,
  },
  title: {
    color: colors.danger,
    fontSize: typography.body,
    fontWeight: '700',
  },
  message: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    lineHeight: 20,
  },
  button: {
    alignSelf: 'flex-start',
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: '700',
  },
});
