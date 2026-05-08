import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '../../api/errors';
import type { StatusResponse } from '../../api/types';
import { AuthConfigErrorBanner } from '../AuthConfigErrorBanner';
import { colors, spacing, typography } from '../../theme/tokens';
import { DashboardCard, dashboardCardStyles } from './DashboardCard';
import { readinessLabel } from './dashboardFormatters';

type Props = {
  statusData: StatusResponse | null;
  error: ApiError | null;
  isLoading: boolean;
  isStaleFailure: boolean;
  onRetry: () => void;
  isFetching: boolean;
  isOffline?: boolean;
  onOpenSettings?: () => void;
};

export function ServiceReadinessCard({ statusData, error, isLoading, isStaleFailure, onRetry, isFetching, isOffline = false, onOpenSettings }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const hasData = Boolean(statusData);
  const ready = statusData?.ready ?? false;
  const showError = !hasData && error;

  return (
    <DashboardCard title="Service readiness" warning={hasData ? !ready : Boolean(showError)}>
      {isLoading && !hasData ? <Text style={dashboardCardStyles.info}>Loading dashboard status…</Text> : null}

      {hasData ? (
        <>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, ready ? styles.okBadge : styles.warnBadge]}>
              <Text style={styles.badgeText}>{readinessLabel(ready)}</Text>
            </View>
            <Text style={dashboardCardStyles.info}>env={statusData?.environment ?? 'unknown'}</Text>
          </View>
          <Text style={dashboardCardStyles.info}>Connection: reachable and authenticated</Text>
        </>
      ) : null}

      {isStaleFailure ? <Text style={styles.warning}>Refresh failed, showing stale dashboard data.</Text> : null}

      {showError && error?.kind === 'auth' && onOpenSettings ? (
        <AuthConfigErrorBanner error={error} onOpenSettings={onOpenSettings} />
      ) : null}

      {showError && (error?.kind !== 'auth' || !onOpenSettings) ? (
        <Text style={styles.errorText}>
          {error?.kind === 'auth'
            ? 'Authentication/configuration issue. Verify API base URL and token in Settings.'
            : error?.message ?? 'Failed to load status.'}
        </Text>
      ) : null}

      {error ? (
        <>
          <Pressable onPress={() => setShowDetails((v) => !v)} style={styles.linkButton}>
            <Text style={styles.linkText}>{showDetails ? 'Hide details' : 'Show details'}</Text>
          </Pressable>
          {showDetails ? (
            <Text style={styles.detailsText}>
              kind={error.kind}
              {error.status ? ` | status=${error.status}` : ''}
              {error.detail ? ` | detail=${error.detail}` : ''}
            </Text>
          ) : null}
        </>
      ) : null}

      {isOffline ? <Text style={styles.warning}>Refresh is disabled while offline.</Text> : null}

      <Pressable
        onPress={onRetry}
        disabled={isFetching || isOffline}
        style={[styles.refreshButton, isOffline ? styles.disabled : null]}
        accessibilityRole="button"
        accessibilityLabel="Retry status"
        accessibilityState={{ disabled: isFetching || isOffline }}
      >
        <Text style={styles.refreshButtonText}>{isFetching ? 'Refreshing…' : 'Refresh'}</Text>
      </Pressable>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  okBadge: {
    backgroundColor: '#1B3A2C',
  },
  warnBadge: {
    backgroundColor: '#4A3B1A',
  },
  badgeText: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  warning: {
    color: '#F2C66D',
    fontSize: typography.caption,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.caption,
  },
  linkButton: {
    alignSelf: 'flex-start',
  },
  linkText: {
    color: colors.accent,
    fontSize: typography.caption,
  },
  detailsText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  refreshButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  refreshButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});
