import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '../api/errors';
import {
  patchMobilePushSettings,
  registerMobilePushInstallation,
  sendMobilePushTest,
  unregisterMobilePushInstallation,
} from '../api/mobilePushApi';
import { queryKeys } from '../api/queryKeys';
import { missingConfigError, requireActiveConfig } from '../api/queryGuards';
import type { PatchMobilePushSettingsRequest, RegisterMobilePushInstallationRequest, SendMobilePushTestRequest } from '../api/types';
import { useConfigStatus } from '../config/ConfigStatusContext';

function missingInstallationError() {
  return new ApiError({
    kind: 'validation',
    message: 'Push installation is missing. Open Settings and set up push notifications again.',
  });
}

export function useRegisterMobilePushInstallation() {
  const { config } = useConfigStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['mobilePush', 'register'],
    mutationFn: (body: RegisterMobilePushInstallationRequest) => registerMobilePushInstallation(requireActiveConfig(config), body),
    retry: false,
    onSettled: () => {
      if (config) void queryClient.invalidateQueries({ queryKey: queryKeys.mobilePush.all(config.apiBaseUrl) });
    },
  });
}

export function useUnregisterMobilePushInstallation() {
  const { config } = useConfigStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['mobilePush', 'unregister'],
    mutationFn: (installationId: string | null) => {
      if (!installationId) throw missingInstallationError();
      return unregisterMobilePushInstallation(requireActiveConfig(config), installationId);
    },
    retry: false,
    onSettled: () => {
      if (config) void queryClient.invalidateQueries({ queryKey: queryKeys.mobilePush.all(config.apiBaseUrl) });
    },
  });
}

export function usePatchMobilePushSettings() {
  const { config } = useConfigStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['mobilePush', 'settings'],
    mutationFn: (body: PatchMobilePushSettingsRequest) => patchMobilePushSettings(requireActiveConfig(config), body),
    retry: false,
    onSettled: () => {
      if (config) void queryClient.invalidateQueries({ queryKey: queryKeys.mobilePush.all(config.apiBaseUrl) });
    },
  });
}

export function useSendMobilePushTest() {
  const { config } = useConfigStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['mobilePush', 'test'],
    mutationFn: (body: SendMobilePushTestRequest) => {
      if (!config) throw missingConfigError();
      return sendMobilePushTest(config, body);
    },
    retry: false,
    onSettled: () => {
      if (config) void queryClient.invalidateQueries({ queryKey: queryKeys.mobilePush.all(config.apiBaseUrl) });
    },
  });
}
