import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { MonitoringFilter } from '../../api/types';
import { colors, spacing, typography } from '../../theme/tokens';

const FILTER_OPTIONS = [
  { label: 'Monitored', value: 'monitored' },
  { label: 'Unmonitored', value: 'unmonitored' },
  { label: 'All', value: 'all' },
] as const satisfies ReadonlyArray<{ label: string; value: MonitoringFilter }>;

type Props = {
  selected: MonitoringFilter;
  onChange: (value: MonitoringFilter) => void;
};

export function ChannelFilterTabs({ selected, onChange }: Props) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {FILTER_OPTIONS.map((option) => {
        const active = selected === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={[styles.tab, active ? styles.activeTab : null]}
          >
            <Text style={[styles.tabText, active ? styles.activeTabText : null]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  activeTab: {
    backgroundColor: colors.accent,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  activeTabText: {
    color: colors.textPrimary,
  },
});
