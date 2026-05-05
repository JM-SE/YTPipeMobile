import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { testStatusConnection } from '../../api/statusTestClient';
import { useConfigStatus } from '../../config/ConfigStatusContext';
import { ConfigFormValues, configFormSchema, normalizeApiBaseUrl, normalizeToken } from '../../config/configSchema';
import { AppStackParamList, SetupStackParamList } from '../../navigation/types';
import { SettingsFeedback } from './types';

type SettingsNavigation = NativeStackNavigationProp<AppStackParamList, 'Settings'> | NativeStackNavigationProp<SetupStackParamList, 'Settings'>;

type Params = {
  navigation: SettingsNavigation;
};

export function useSettingsController({ navigation }: Params) {
  const queryClient = useQueryClient();
  const { activateConfig, clearConfig, config } = useConfigStatus();
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [feedback, setFeedback] = useState<SettingsFeedback | null>(null);

  const defaultValues = useMemo<ConfigFormValues>(
    () => ({
      apiBaseUrl: config?.apiBaseUrl ?? '',
      mobileApiToken: config?.mobileApiToken ?? '',
    }),
    [config?.apiBaseUrl, config?.mobileApiToken],
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema),
    mode: 'onChange',
    defaultValues,
    values: defaultValues,
  });

  const toggleTokenVisibility = useCallback(() => {
    setShowToken((current) => !current);
  }, []);

  const onSaveAndTest = handleSubmit(async (values) => {
    setSaving(true);
    setFeedback(null);

    const apiBaseUrl = normalizeApiBaseUrl(values.apiBaseUrl);
    const mobileApiToken = normalizeToken(values.mobileApiToken);

    try {
      const statusResult = await testStatusConnection(apiBaseUrl, mobileApiToken);
      await activateConfig({ apiBaseUrl, mobileApiToken });
      queryClient.clear();
      const readyText = typeof statusResult.ready === 'boolean' ? `ready=${String(statusResult.ready)}` : 'ready=unknown';
      const envText = statusResult.environment ? `env=${statusResult.environment}` : 'env=unknown';
      setFeedback({
        type: 'success',
        message: `Configuration saved and tested successfully (${envText}, ${readyText}).`,
      });

      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Save and Test failed. Backend may be unavailable/sleeping or token/base URL may be invalid.',
      });
    } finally {
      setSaving(false);
    }
  });

  const onClearConfig = useCallback(async () => {
    setClearing(true);
    setFeedback(null);
    try {
      await clearConfig();
      queryClient.clear();
    } catch {
      setFeedback({ type: 'error', message: 'Failed to clear local configuration.' });
    } finally {
      setClearing(false);
    }
  }, [clearConfig, queryClient]);

  return {
    control,
    errors,
    showToken,
    saving,
    clearing,
    feedback,
    onSaveAndTest,
    onClearConfig,
    toggleTokenVisibility,
  };
}
