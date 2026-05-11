import { useQuery } from '@tanstack/react-query';

import { useConfigStatus } from '../config/ConfigStatusContext';
import { getMobilePushStatus } from '../api/mobilePushApi';
import { queryKeys } from '../api/queryKeys';
import { requireActiveConfig, retryTransientApiError } from '../api/queryGuards';
import type { ApiError } from '../api/errors';

type Params = {
  installationId: string | null;
};

export function useMobilePushStatus({ installationId }: Params) {
  const { config, status } = useConfigStatus();
  const enabled = status === 'present' && Boolean(config) && Boolean(installationId);
  const baseUrl = config?.apiBaseUrl ?? 'no-config';
  const safeInstallationId = installationId ?? 'no-installation';

  return useQuery({
    queryKey: queryKeys.mobilePush.status(baseUrl, safeInstallationId),
    queryFn: () => getMobilePushStatus(requireActiveConfig(config), safeInstallationId),
    enabled,
    retry: retryTransientApiError,
    placeholderData: (previous) => previous,
  });
}
