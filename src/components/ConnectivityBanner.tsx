import { StyleSheet, Text, View } from 'react-native';

import { useConnectivityStatus } from '../connectivity/ConnectivityContext';
import { colors, spacing, typography } from '../theme/tokens';

export function ConnectivityBanner() {
  const { isOffline } = useConnectivityStatus();

  if (!isOffline) return null;

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.title}>Offline mode</Text>
      <Text style={styles.message}>Fresh API requests are paused. You can keep navigating and view cached data.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderColor: colors.warning,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.warningSurface,
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  message: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 18,
  },
});
