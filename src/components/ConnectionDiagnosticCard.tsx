import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '../api/errors';
import { useStatusQuery } from '../api/useStatusQuery';
import { colors, spacing, typography } from '../theme/tokens';

function statusLine(ready: boolean | undefined) {
  if (ready === undefined) return 'ready=unknown';
  return `ready=${String(ready)}`;
}

export function ConnectionDiagnosticCard() {
  const [showDetails, setShowDetails] = useState(false);
  const query = useStatusQuery();
  const error = query.error as ApiError | null;

  const hasData = Boolean(query.data);
  const isStaleFailure = hasData && query.isRefetchError;
  const isInitialError = !hasData && query.isError;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Connection diagnostic</Text>

      {query.isLoading ? <Text style={styles.info}>Checking backend status…</Text> : null}

      {query.data ? (
        <View style={styles.stateBlock}>
          <Text style={styles.successText}>Reachable and authenticated</Text>
          <Text style={styles.info}>env={query.data.environment} · {statusLine(query.data.ready)}</Text>
        </View>
      ) : null}

      {isStaleFailure ? (
        <Text style={styles.warning}>Refresh failed, showing stale status. You can retry.</Text>
      ) : null}

      {isInitialError ? (
        <Text style={styles.error}>
          {error?.kind === 'auth'
            ? 'Authentication/configuration issue. Verify token/base URL in Settings.'
            : error?.message ?? 'Failed to load status.'}
        </Text>
      ) : null}

      {(query.isError || query.isRefetchError) && error ? (
        <View style={styles.detailsWrap}>
          <Pressable style={styles.linkButton} onPress={() => setShowDetails((value) => !value)}>
            <Text style={styles.linkText}>{showDetails ? 'Hide details' : 'Show details'}</Text>
          </Pressable>
          {showDetails ? (
            <Text style={styles.detailsText}>
              kind={error.kind}
              {error.status ? ` | status=${error.status}` : ''}
              {error.detail ? ` | detail=${error.detail}` : ''}
            </Text>
          ) : null}
        </View>
      ) : null}

      <Pressable style={styles.retryButton} onPress={() => void query.refetch()} disabled={query.isFetching}>
        <Text style={styles.retryButtonText}>{query.isFetching ? 'Retrying…' : 'Retry'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: typography.body,
  },
  stateBlock: {
    gap: spacing.xs,
  },
  successText: {
    color: colors.success,
    fontWeight: '600',
  },
  info: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  warning: {
    color: '#F2C66D',
    fontSize: typography.caption,
  },
  error: {
    color: colors.danger,
    fontSize: typography.caption,
  },
  detailsWrap: {
    gap: spacing.xs,
  },
  detailsText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  linkButton: {
    alignSelf: 'flex-start',
  },
  linkText: {
    color: colors.accent,
    fontSize: typography.caption,
  },
  retryButton: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
