import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import type { Channel, MobilePushChannelPreference } from '../../api/types';
import { colors, spacing, typography } from '../../theme/tokens';

type Props = {
  channel: Channel;
  disabled?: boolean;
  pushPreference?: MobilePushChannelPreference;
  onPress: (channel: Channel) => void;
  onToggle: (channel: Channel, nextValue: boolean) => void;
};

function pushPreferenceLabel(pushPreference: MobilePushChannelPreference | undefined) {
  if (!pushPreference) return null;
  if (!pushPreference.is_monitored || !pushPreference.push_eligible) return 'Push not eligible';
  return pushPreference.push_enabled ? 'Push enabled' : 'Push disabled';
}

export function ChannelListItem({ channel, disabled = false, pushPreference, onPress, onToggle }: Props) {
  const { title, is_monitored, latest_detected_video } = channel;
  const pushLabel = is_monitored ? pushPreferenceLabel(pushPreference) : null;

  return (
    <Pressable accessibilityRole="button" onPress={() => onPress(channel)} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.badge, is_monitored ? styles.monitored : styles.unmonitored]}>
            {is_monitored ? 'Monitored' : 'Catalog only'}
          </Text>
          {pushLabel ? (
            <Text style={[styles.badge, pushPreference?.push_enabled ? styles.pushEnabled : styles.pushDisabled]}>{pushLabel}</Text>
          ) : null}
        </View>
        <Switch
          value={is_monitored}
          disabled={disabled}
          onValueChange={(nextValue) => onToggle(channel, nextValue)}
          thumbColor={is_monitored ? colors.accent : colors.textSecondary}
          accessibilityLabel={`${is_monitored ? 'Disable' : 'Enable'} monitoring for ${title}`}
        />
      </View>
      {latest_detected_video ? (
        <Text style={styles.latest} numberOfLines={2}>
          Latest: {latest_detected_video.title}
        </Text>
      ) : (
        <Text style={styles.latest}>No detected video yet.</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  monitored: {
    color: colors.success,
    backgroundColor: colors.successSurface,
  },
  unmonitored: {
    color: colors.textSecondary,
    backgroundColor: colors.mutedSurface,
  },
  pushEnabled: {
    color: colors.accent,
    backgroundColor: colors.mutedSurface,
  },
  pushDisabled: {
    color: colors.warning,
    backgroundColor: colors.warningSurface,
  },
  latest: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
});
