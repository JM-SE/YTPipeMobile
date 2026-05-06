import { ServiceReadinessCard } from './dashboard/ServiceReadinessCard';

import { ApiError } from '../api/errors';
import { useStatusQuery } from '../api/useStatusQuery';

export function ConnectionDiagnosticCard() {
  const { data, error, isLoading, isRefetchError, refetch, isFetching } = useStatusQuery();

  return (
    <ServiceReadinessCard
      statusData={data ?? null}
      error={error as ApiError | null}
      isLoading={isLoading}
      isStaleFailure={Boolean(data) && isRefetchError}
      onRetry={() => void refetch()}
      isFetching={isFetching}
    />
  );
}
