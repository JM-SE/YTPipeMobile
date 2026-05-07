import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ActivityStatusFilter } from '../../api/types';
import { colors, spacing, typography } from '../../theme/tokens';
import { activityFilterLabel } from './activityFormatters';

const FILTER_OPTIONS = ['all', 'pending', 'delivered', 'pending_retry', 'failed'] as const satisfies ReadonlyArray<ActivityStatusFilter>;

type Props = {
  selected: ActivityStatusFilter;
  onChange: (value: ActivityStatusFilter) => void;
};

export function ActivityStatusFilterTabs({ selected, onChange }: Props) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {FILTER_OPTIONS.map((value) => {
        const active = selected === value;
        return (
          <Pressable
            key={value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(value)}
            style={[styles.tab, active ? styles.activeTab : null]}
          >
            <Text style={[styles.tabText, active ? styles.activeTabText : null]}>{activityFilterLabel(value)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tab: {
    flexGrow: 1,
    minWidth: '20%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
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
