import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ActivityItem } from '../../api/types';
import { colors, spacing, typography } from '../../theme/tokens';
import { ActivityDetailRow } from './ActivityDetailRow';
import { deliveryStatusLabel, formatActivityTime, hasDeliveryError } from './activityFormatters';

type Props = {
  item: ActivityItem;
  expanded: boolean;
  linkError?: string;
  onToggleExpanded: (activityId: number) => void;
  onOpenYoutube: (item: ActivityItem) => void;
};

export function ActivityListItem({ item, expanded, linkError, onToggleExpanded, onOpenYoutube }: Props) {
  const hasError = hasDeliveryError(item.delivery_status);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${expanded ? 'Collapse' : 'Expand'} activity for ${item.video_title}`}
      accessibilityState={{ expanded }}
      onPress={() => onToggleExpanded(item.activity_id)}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.title} numberOfLines={2}>{item.video_title}</Text>
          <Text style={styles.channel}>{item.channel_title}</Text>
        </View>
        <Text style={[styles.badge, hasError ? styles.errorBadge : styles.normalBadge]}>{deliveryStatusLabel(item.delivery_status)}</Text>
      </View>

      <View style={styles.timeGroup}>
        <Text style={styles.meta}>{formatActivityTime('Detected', item.detected_at)}</Text>
        <Text style={styles.meta}>{formatActivityTime('Published', item.published_at)}</Text>
      </View>

      {hasError ? <Text style={styles.errorHint}>Error details available</Text> : null}

      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Open YouTube video for ${item.video_title}`}
        onPress={(event) => {
          event?.stopPropagation?.();
          onOpenYoutube(item);
        }}
        style={styles.linkButton}
      >
        <Text style={styles.linkText}>Open YouTube</Text>
      </Pressable>

      {linkError ? <Text style={styles.linkError}>{linkError}</Text> : null}

      {expanded ? (
        <View style={styles.details}>
          <ActivityDetailRow label="Activity ID" value={String(item.activity_id)} />
          <ActivityDetailRow label="Delivery ID" value={String(item.delivery_id)} />
          <ActivityDetailRow label="Video ID" value={String(item.video_id)} />
          <ActivityDetailRow label="YouTube video ID" value={item.youtube_video_id} />
          <ActivityDetailRow label="Channel ID" value={String(item.channel_id)} />
          <ActivityDetailRow label="Last attempt" value={formatActivityTime('', item.last_attempt_at).replace(/^: /, '')} />
          {hasError && item.last_error ? <ActivityDetailRow label="Last error" value={item.last_error} /> : null}
        </View>
      ) : null}
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
    alignItems: 'flex-start',
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
  channel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  badge: {
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  normalBadge: {
    color: colors.success,
    backgroundColor: colors.successSurface,
  },
  errorBadge: {
    color: colors.danger,
    backgroundColor: colors.dangerSurface,
  },
  timeGroup: {
    gap: spacing.xs,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  errorHint: {
    color: colors.danger,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  linkButton: {
    alignSelf: 'flex-start',
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  linkText: {
    color: colors.accent,
    fontWeight: '700',
  },
  linkError: {
    color: colors.danger,
    fontSize: typography.caption,
  },
  details: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
});
