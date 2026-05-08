import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ChannelEducationModal } from '../components/channels/ChannelEducationModal';
import { ChannelErrorBanner } from '../components/channels/ChannelErrorBanner';
import { ScreenShell } from '../components/ScreenShell';
import { useChannelMonitoringToggle } from '../hooks/useChannelMonitoringToggle';
import type { AppStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<AppStackParamList, 'ChannelDetail'>;

export function ChannelDetailScreen({ route }: Props) {
  const { channel } = route.params;
  const [isMonitored, setIsMonitored] = useState(channel.is_monitored);
  const monitoringToggle = useChannelMonitoringToggle();

  const handleToggle = (nextValue: boolean) => {
    monitoringToggle.requestToggle(
      { ...channel, is_monitored: isMonitored },
      nextValue,
      {
        onOptimistic: setIsMonitored,
        onRollback: setIsMonitored,
      },
    );
  };

  return (
    <ScreenShell title={channel.title} subtitle="Channel monitoring details.">
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.copy}>
            <Text style={styles.label}>Monitoring</Text>
            <Text style={styles.description}>
              {isMonitored
                ? 'This channel is eligible for future polling and detection.'
                : 'This channel is catalog-only until monitoring is enabled.'}
            </Text>
          </View>
            <Switch
            value={isMonitored}
            disabled={monitoringToggle.isPending || monitoringToggle.isOffline}
            onValueChange={handleToggle}
            accessibilityLabel={`${isMonitored ? 'Disable' : 'Enable'} monitoring for ${channel.title}`}
          />
        </View>
        {monitoringToggle.isOffline ? <Text style={styles.description}>Monitoring changes are disabled while offline.</Text> : null}
      </View>

      {channel.latest_detected_video ? (
        <View style={styles.card}>
          <Text style={styles.label}>Latest detected video</Text>
          <Text style={styles.title}>{channel.latest_detected_video.title}</Text>
          <Text style={styles.description}>Published: {channel.latest_detected_video.published_at}</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.label}>Latest detected video</Text>
          <Text style={styles.description}>No detected video is available yet.</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>How monitoring works</Text>
        <Text style={styles.description}>
          Enabling monitoring affects future polling only. It does not notify for older videos. Disabling monitoring
          removes this channel from future polling, detection, and notification workflows.
        </Text>
      </View>

      <ChannelErrorBanner error={monitoringToggle.lastError} onDismiss={monitoringToggle.clearError} />
      <ChannelEducationModal
        visible={Boolean(monitoringToggle.educationChannel)}
        channelTitle={monitoringToggle.educationChannel?.title}
        onCancel={monitoringToggle.cancelEducation}
        onConfirm={monitoringToggle.confirmEducation}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700',
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.subtitle,
    fontWeight: '700',
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 20,
  },
});
