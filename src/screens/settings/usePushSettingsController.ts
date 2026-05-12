import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ApiError } from '../../api/errors';
import {
  usePatchMobilePushSettings,
  useRegisterMobilePushInstallation,
  useSendMobilePushTest,
  useUnregisterMobilePushInstallation,
} from '../../hooks/useMobilePushMutations';
import { useMobilePushStatus } from '../../hooks/useMobilePushStatus';
import type { PushPermissionState } from '../../notifications/pushRegistration';
import { getRemotePushUnavailableReason } from '../../notifications/pushRuntimeEnvironment';
import { getOrCreatePushInstallationId, getPushInstallationId, maskInstallationId } from '../../storage/pushInstallationStorage';
import { useConfigStatus } from '../../config/ConfigStatusContext';
import { useConnectivityStatus } from '../../connectivity/ConnectivityContext';
import type { SettingsFeedback } from './types';

function formatMutationError(error: unknown, fallback: string): SettingsFeedback {
  const message = error instanceof Error ? error.message : fallback;
  return { type: 'error', message };
}

export function usePushSettingsController() {
  const { config, status: configStatus } = useConfigStatus();
  const { isOffline } = useConnectivityStatus();
  const [installationId, setInstallationId] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PushPermissionState>('undetermined');
  const [feedback, setFeedback] = useState<SettingsFeedback | null>(null);
  const remotePushUnavailableReason = getRemotePushUnavailableReason();

  const statusQuery = useMobilePushStatus({ installationId });
  const registerMutation = useRegisterMobilePushInstallation();
  const unregisterMutation = useUnregisterMobilePushInstallation();
  const settingsMutation = usePatchMobilePushSettings();
  const testMutation = useSendMobilePushTest();

  useEffect(() => {
    let cancelled = false;

    async function loadLocalState() {
      if (remotePushUnavailableReason) {
        const storedInstallationId = await getPushInstallationId();
        if (cancelled) return;
        setInstallationId(storedInstallationId);
        setPermissionState('not_requested');
        return;
      }

      const [{ getPushPermissionState }, storedInstallationId] = await Promise.all([
        import('../../notifications/pushRegistration'),
        getPushInstallationId(),
      ]);
      const permission = await getPushPermissionState();
      if (cancelled) return;
      setInstallationId(storedInstallationId);
      setPermissionState(permission);
    }

    void loadLocalState();

    return () => {
      cancelled = true;
    };
  }, [remotePushUnavailableReason]);

  const hasValidConfig = configStatus === 'present' && Boolean(config);
  const status = statusQuery.data;
  const isRegistered = Boolean(status?.installation.registered);
  const isPermissionGranted = permissionState === 'granted';
  const isBusy = registerMutation.isPending || unregisterMutation.isPending || settingsMutation.isPending || testMutation.isPending;

  const maskedInstallationId = useMemo(() => (installationId ? maskInstallationId(installationId) : null), [installationId]);

  const refreshPermissionState = useCallback(async () => {
    if (remotePushUnavailableReason) {
      setFeedback({ type: 'error', message: remotePushUnavailableReason });
      setPermissionState('not_requested');
      return 'not_requested';
    }

    const { getPushPermissionState } = await import('../../notifications/pushRegistration');
    const nextPermission = await getPushPermissionState();
    setPermissionState(nextPermission);
    return nextPermission;
  }, [remotePushUnavailableReason]);

  const setupPush = useCallback(async () => {
    if (!hasValidConfig) {
      setFeedback({ type: 'error', message: 'Save and Test backend configuration before enabling push notifications.' });
      return;
    }

    if (remotePushUnavailableReason) {
      setFeedback({ type: 'error', message: remotePushUnavailableReason });
      return;
    }

    if (isOffline) {
      setFeedback({ type: 'error', message: 'Reconnect before setting up push notifications.' });
      return;
    }

    setFeedback(null);

    try {
      const { getExpoPushToken, getPushRegistrationMetadata, requestPushPermission } = await import('../../notifications/pushRegistration');
      const permission = await requestPushPermission();
      setPermissionState(permission);

      if (permission !== 'granted') {
        setFeedback({ type: 'error', message: 'Notification permission was not granted. Enable notifications in system settings to use push.' });
        return;
      }

      const nextInstallationId = await getOrCreatePushInstallationId();
      setInstallationId(nextInstallationId);
      const expoPushToken = await getExpoPushToken();
      const metadata = getPushRegistrationMetadata();

      await registerMutation.mutateAsync({
        installation_id: nextInstallationId,
        expo_push_token: expoPushToken,
        ...metadata,
      });

      setFeedback({ type: 'success', message: 'Push notifications registered for this device.' });
    } catch (error) {
      setFeedback(formatMutationError(error, 'Push registration failed. Retry from Settings.'));
    }
  }, [hasValidConfig, isOffline, registerMutation, remotePushUnavailableReason]);

  const unregisterPush = useCallback(async () => {
    if (!installationId) {
      setFeedback({ type: 'error', message: 'No push installation is registered on this device.' });
      return;
    }

    if (isOffline) {
      setFeedback({ type: 'error', message: 'Reconnect before unregistering this device.' });
      return;
    }

    setFeedback(null);
    try {
      await unregisterMutation.mutateAsync(installationId);
      setFeedback({ type: 'success', message: 'This device was unregistered for push notifications.' });
    } catch (error) {
      setFeedback(formatMutationError(error, 'Could not unregister this device.'));
    }
  }, [installationId, isOffline, unregisterMutation]);

  const setGlobalPushEnabled = useCallback(
    async (enabled: boolean) => {
      if (remotePushUnavailableReason) {
        setFeedback({ type: 'error', message: remotePushUnavailableReason });
        return;
      }

      if (isOffline) {
        setFeedback({ type: 'error', message: 'Reconnect before changing push settings.' });
        return;
      }

      setFeedback(null);
      try {
        await settingsMutation.mutateAsync({
          enabled,
          default_for_monitored_channels: status?.global.default_for_monitored_channels ?? true,
        });
        setFeedback({ type: 'success', message: `Global push notifications ${enabled ? 'enabled' : 'disabled'}.` });
      } catch (error) {
        setFeedback(formatMutationError(error, 'Could not update global push settings.'));
      }
    },
    [isOffline, remotePushUnavailableReason, settingsMutation, status?.global.default_for_monitored_channels],
  );

  const sendTestPush = useCallback(async () => {
    if (remotePushUnavailableReason) {
      setFeedback({ type: 'error', message: remotePushUnavailableReason });
      return;
    }

    if (!installationId) {
      setFeedback({ type: 'error', message: 'Register this device before sending a test notification.' });
      return;
    }

    if (isOffline) {
      setFeedback({ type: 'error', message: 'Reconnect before sending a test notification.' });
      return;
    }

    setFeedback(null);
    try {
      const result = await testMutation.mutateAsync({ installation_id: installationId });
      setFeedback({ type: 'success', message: result.message || 'Test notification sent.' });
    } catch (error) {
      setFeedback(formatMutationError(error as ApiError, 'Could not send test notification.'));
    }
  }, [installationId, isOffline, remotePushUnavailableReason, testMutation]);

  const remotePushUnavailable = Boolean(remotePushUnavailableReason);
  const setupDisabled = !hasValidConfig || isOffline || isBusy || isRegistered || remotePushUnavailable;
  const unregisterDisabled = !hasValidConfig || isOffline || isBusy || !installationId;
  const globalToggleDisabled = !hasValidConfig || isOffline || isBusy || !isRegistered || !isPermissionGranted || remotePushUnavailable;
  const testDisabled = !hasValidConfig || isOffline || isBusy || !isRegistered || !isPermissionGranted || !installationId || remotePushUnavailable;

  return {
    delivery: status?.delivery ?? null,
    feedback,
    globalStatus: status?.global ?? null,
    installationStatus: status?.installation ?? null,
    isBusy,
    isOffline,
    isPermissionGranted,
    isRegistered,
    remotePushUnavailableReason,
    maskedInstallationId,
    permissionState,
    pushStatusError: statusQuery.error,
    pushStatusLoading: statusQuery.isLoading,
    refreshPermissionState,
    sendTestPush,
    setGlobalPushEnabled,
    setupDisabled,
    setupPush,
    testDisabled,
    unregisterDisabled,
    unregisterPush,
    globalToggleDisabled,
  };
}
