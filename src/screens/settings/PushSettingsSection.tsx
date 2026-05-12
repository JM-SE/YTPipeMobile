import { Pressable, Switch, Text, View } from 'react-native';

import { colors } from '../../theme/tokens';
import { FeedbackBanner } from './FeedbackBanner';
import { styles } from './SettingsScreen.styles';
import { usePushSettingsController } from './usePushSettingsController';

function formatNullable(value: string | null | undefined): string {
  return value || 'Unavailable';
}

export function PushSettingsSection() {
  const {
    delivery,
    feedback,
    globalStatus,
    installationStatus,
    isBusy,
    isOffline,
    isRegistered,
    maskedInstallationId,
    permissionState,
    pushStatusError,
    pushStatusLoading,
    remotePushUnavailableReason,
    sendTestPush,
    setGlobalPushEnabled,
    setupDisabled,
    setupPush,
    testDisabled,
    unregisterDisabled,
    unregisterPush,
    globalToggleDisabled,
  } = usePushSettingsController();

  const globalEnabled = Boolean(globalStatus?.enabled);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Push notifications</Text>
      <Text style={styles.helperText}>Enable Expo push alerts for new videos detected on monitored channels.</Text>

      <Text style={styles.helperText}>Permission: {permissionState}</Text>
      <Text style={styles.helperText}>Installation: {maskedInstallationId ?? 'Not created yet'}</Text>
      <Text style={styles.helperText}>Backend registration: {isRegistered ? 'Registered' : 'Not registered'}</Text>
      {installationStatus?.token_masked ? <Text style={styles.helperText}>Token: {installationStatus.token_masked}</Text> : null}
      {pushStatusLoading ? <Text style={styles.helperText}>Loading push status...</Text> : null}
      {pushStatusError ? <Text style={styles.errorText}>{pushStatusError.message}</Text> : null}
      {remotePushUnavailableReason ? <Text style={styles.warningText}>{remotePushUnavailableReason}</Text> : null}
      {isOffline ? <Text style={styles.warningText}>Push actions are disabled while offline. Cached status remains visible.</Text> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Set up push notifications"
        accessibilityState={{ disabled: setupDisabled }}
        style={[styles.secondaryButton, setupDisabled ? styles.disabledButton : null]}
        disabled={setupDisabled}
        onPress={setupPush}
      >
        <Text style={styles.secondaryButtonText}>{isBusy ? 'Working...' : isRegistered ? 'Device registered' : 'Set up push notifications'}</Text>
      </Pressable>

      <View style={styles.inlineRow}>
        <View style={styles.inlineTextBlock}>
          <Text style={styles.helperTitle}>Global push</Text>
          <Text style={styles.helperText}>Default for monitored channels: {String(globalStatus?.default_for_monitored_channels ?? true)}</Text>
        </View>
        <Switch
          accessibilityLabel="Toggle global push notifications"
          accessibilityState={{ disabled: globalToggleDisabled }}
          value={globalEnabled}
          disabled={globalToggleDisabled}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor={globalEnabled ? colors.textPrimary : colors.textSecondary}
          onValueChange={setGlobalPushEnabled}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send test push notification"
        accessibilityState={{ disabled: testDisabled }}
        style={[styles.primaryButton, testDisabled ? styles.disabledButton : null]}
        disabled={testDisabled}
        onPress={sendTestPush}
      >
        <Text style={styles.primaryButtonText}>Send Test Notification</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Unregister this device from push notifications"
        accessibilityState={{ disabled: unregisterDisabled }}
        style={[styles.secondaryButton, unregisterDisabled ? styles.disabledButton : null]}
        disabled={unregisterDisabled}
        onPress={unregisterPush}
      >
        <Text style={styles.secondaryButtonText}>Unregister this device</Text>
      </Pressable>

      <View style={styles.diagnosticsCard}>
        <Text style={styles.helperTitle}>Delivery diagnostics</Text>
        <Text style={styles.helperText}>Last attempt: {formatNullable(delivery?.last_attempt_at)}</Text>
        <Text style={styles.helperText}>Last success: {formatNullable(delivery?.last_success_at)}</Text>
        <Text style={styles.helperText}>Expo status: {formatNullable(delivery?.last_expo_status)}</Text>
        {delivery?.last_error ? <Text style={styles.errorText}>Last error: {delivery.last_error}</Text> : null}
      </View>

      <FeedbackBanner feedback={feedback} />
    </View>
  );
}
