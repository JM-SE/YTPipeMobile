import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ConnectivityBanner } from './ConnectivityBanner';
import { colors, spacing, typography } from '../theme/tokens';

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  scrollable?: boolean;
}>;

export function ScreenShell({ title, subtitle, children, scrollable = false }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <ConnectivityBanner />
      {scrollable ? (
        <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollView}>
          {children}
        </ScrollView>
      ) : (
        <View style={styles.content}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  content: {
    flex: 1,
    gap: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
});
