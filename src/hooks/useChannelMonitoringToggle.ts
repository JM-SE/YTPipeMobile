import { useEffect, useRef, useState } from 'react';

import type { ApiError } from '../api/errors';
import type { Channel } from '../api/types';
import { useUpdateChannelMonitoringMutation } from '../api/useUpdateChannelMonitoringMutation';
import { useConfigStatus } from '../config/ConfigStatusContext';
import { useConnectivityStatus } from '../connectivity/ConnectivityContext';
import { acknowledgeChannelEducation, hasAcknowledgedChannelEducation } from '../storage/channelEducationStorage';

type ToggleCallbacks = {
  onOptimistic?: (nextValue: boolean) => void;
  onRollback?: (nextValue: boolean) => void;
};

type PendingToggle = {
  channel: Channel;
  nextValue: boolean;
  callbacks?: ToggleCallbacks;
};

export function useChannelMonitoringToggle() {
  const { config } = useConfigStatus();
  const { isOffline } = useConnectivityStatus();
  const mutation = useUpdateChannelMonitoringMutation();
  const [educationAcknowledged, setEducationAcknowledged] = useState(false);
  const educationStateRef = useRef({ baseUrl: '', acknowledged: false });
  const [pendingEducationToggle, setPendingEducationToggle] = useState<PendingToggle | null>(null);
  const [lastError, setLastError] = useState<ApiError | null>(null);

  useEffect(() => {
    let active = true;

    const baseUrl = config?.apiBaseUrl ?? '';

    if (!baseUrl) {
      if (educationStateRef.current.acknowledged || educationStateRef.current.baseUrl) {
        educationStateRef.current = { baseUrl: '', acknowledged: false };
        setEducationAcknowledged(false);
      }
      return;
    }

    hasAcknowledgedChannelEducation(baseUrl)
      .then((acknowledged) => {
        if (!active) return;
        const shouldUpdateState = educationStateRef.current.acknowledged !== acknowledged;
        if (educationStateRef.current.baseUrl !== baseUrl || shouldUpdateState) {
          educationStateRef.current = { baseUrl, acknowledged };
          if (shouldUpdateState) setEducationAcknowledged(acknowledged);
        }
      })
      .catch(() => {
        if (!active) return;
        const shouldUpdateState = educationStateRef.current.acknowledged;
        if (educationStateRef.current.baseUrl !== baseUrl || shouldUpdateState) {
          educationStateRef.current = { baseUrl, acknowledged: false };
          if (shouldUpdateState) setEducationAcknowledged(false);
        }
      });

    return () => {
      active = false;
    };
  }, [config?.apiBaseUrl]);

  const executeToggle = ({ channel, nextValue, callbacks }: PendingToggle) => {
    if (isOffline) return;

    setLastError(null);
    callbacks?.onOptimistic?.(nextValue);
    mutation.mutate(
      { channelId: channel.channel_id, isMonitored: nextValue },
      {
        onError: (error) => {
          callbacks?.onRollback?.(!nextValue);
          setLastError(error);
        },
      },
    );
  };

  const requestToggle = (channel: Channel, nextValue: boolean, callbacks?: ToggleCallbacks) => {
    if (isOffline) return;

    if (nextValue && !educationAcknowledged) {
      setPendingEducationToggle({ channel, nextValue, callbacks });
      return;
    }

    executeToggle({ channel, nextValue, callbacks });
  };

  const confirmEducation = async () => {
    if (!pendingEducationToggle || !config?.apiBaseUrl) return;

    await acknowledgeChannelEducation(config.apiBaseUrl);
    educationStateRef.current = { baseUrl: config.apiBaseUrl, acknowledged: true };
    setEducationAcknowledged(true);
    const toggle = pendingEducationToggle;
    setPendingEducationToggle(null);
    executeToggle(toggle);
  };

  return {
    requestToggle,
    confirmEducation,
    cancelEducation: () => setPendingEducationToggle(null),
    educationChannel: pendingEducationToggle?.channel ?? null,
    lastError,
    clearError: () => setLastError(null),
    isOffline,
    isPending: mutation.isPending,
    pendingChannelId: mutation.variables?.channelId,
  };
}
