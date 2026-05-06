import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ApiError } from '../../api/errors';
import { useRunPollMutation, useSyncSubscriptionsMutation } from '../../api/useManualActionsMutations';
import type { PollResult, SyncResult } from '../../api/types';
import { colors, spacing, typography } from '../../theme/tokens';
import { DashboardCard } from './DashboardCard';
import {
  formatManualActionError,
  formatPollSuccess,
  formatSyncSuccess,
  quotaBlockedMessage,
} from './manualActionMessages';

const ACTION = {
  SYNC: 'sync',
  POLL: 'poll',
} as const;

type ManualAction = (typeof ACTION)[keyof typeof ACTION];

type ResultState =
  | { kind: 'syncSuccess'; result: SyncResult }
  | { kind: 'pollSuccess'; result: PollResult }
  | { kind: 'error'; action: ManualAction; error: ApiError }
  | null;

export function DashboardQuickActionsCard() {
  const syncMutation = useSyncSubscriptionsMutation();
  const pollMutation = useRunPollMutation();
  const [activeAction, setActiveAction] = useState<ManualAction | null>(null);
  const [result, setResult] = useState<ResultState>(null);
  const isRunning = syncMutation.isPending || pollMutation.isPending;

  const runSync = () => {
    setActiveAction(ACTION.SYNC);
    setResult(null);
    syncMutation.mutate(undefined, {
      onSuccess: (syncResult) => setResult({ kind: 'syncSuccess', result: syncResult }),
      onError: (error) => setResult({ kind: 'error', action: ACTION.SYNC, error }),
      onSettled: () => setActiveAction(null),
    });
  };

  const runPoll = () => {
    setActiveAction(ACTION.POLL);
    setResult(null);
    pollMutation.mutate(undefined, {
      onSuccess: (pollResult) => setResult({ kind: 'pollSuccess', result: pollResult }),
      onError: (error) => setResult({ kind: 'error', action: ACTION.POLL, error }),
      onSettled: () => setActiveAction(null),
    });
  };

  return (
    <DashboardCard title="Manual actions" warning={result?.kind === 'pollSuccess' && result.result.quota_blocked}>
      <View style={styles.row}>
        <ActionButton
          label="Sync subscriptions"
          accessibilityLabel="Sync subscriptions"
          disabled={isRunning}
          onPress={runSync}
        />
        <ActionButton label="Run poll" accessibilityLabel="Run poll" disabled={isRunning} onPress={runPoll} />
      </View>

      {isRunning ? (
        <Text style={styles.running}>{activeAction === ACTION.SYNC ? 'Sync subscriptions is running…' : 'Run poll is running…'}</Text>
      ) : null}

      <View style={styles.educationGroup}>
        <Text style={styles.info}>
          Sync imports or updates the subscription catalog only. It does not enable monitoring, baseline all channels, or
          send notifications. Backend Google OAuth authorization may be required.
        </Text>
        <Text style={styles.info}>
          Poll checks monitored channels only, may create baselines for monitored channels, detects new videos only for
          monitored workflows, and may consume quota.
        </Text>
      </View>

      <ManualActionFeedback result={result} />
    </DashboardCard>
  );
}

type ActionButtonProps = {
  label: string;
  accessibilityLabel: string;
  disabled: boolean;
  onPress: () => void;
};

function ActionButton({ label, accessibilityLabel, disabled, onPress }: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled ? styles.disabled : null]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

function ManualActionFeedback({ result }: { result: ResultState }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!result) return null;

  if (result.kind === 'syncSuccess') {
    return <FeedbackBox tone="success" title="Sync complete" message={formatSyncSuccess(result.result)} />;
  }

  if (result.kind === 'pollSuccess') {
    return (
      <>
        <FeedbackBox
          tone={result.result.quota_blocked ? 'warning' : 'success'}
          title="Poll complete"
          message={formatPollSuccess(result.result)}
        />
        {result.result.quota_blocked ? (
          <FeedbackBox tone="warning" title="Quota/safety alert" message={quotaBlockedMessage()} />
        ) : null}
      </>
    );
  }

  const details = result.error.detail ?? result.error.technical;

  return (
    <View style={[styles.feedback, styles.error]} accessibilityRole="alert">
      <Text style={styles.feedbackTitle}>Action failed</Text>
      <Text style={styles.feedbackMessage}>{formatManualActionError(result.action, result.error)}</Text>
      {showDetails && details ? <Text style={styles.details}>{details}</Text> : null}
      {details ? (
        <Pressable onPress={() => setShowDetails((value) => !value)}>
          <Text style={styles.detailsButton}>{showDetails ? 'Hide details' : 'Show details'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type FeedbackTone = 'success' | 'warning';

function FeedbackBox({ tone, title, message }: { tone: FeedbackTone; title: string; message: string }) {
  return (
    <View style={[styles.feedback, tone === 'success' ? styles.success : styles.warning]} accessibilityRole="alert">
      <Text style={styles.feedbackTitle}>{title}</Text>
      <Text style={styles.feedbackMessage}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  running: {
    color: colors.accent,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  educationGroup: {
    gap: spacing.xs,
  },
  info: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 18,
  },
  feedback: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    gap: spacing.xs,
  },
  success: {
    borderColor: colors.success,
    backgroundColor: 'rgba(76, 195, 138, 0.12)',
  },
  warning: {
    borderColor: '#F2C66D',
    backgroundColor: '#2A2418',
  },
  error: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(239, 107, 115, 0.12)',
  },
  feedbackTitle: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  feedbackMessage: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 18,
  },
  details: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  detailsButton: {
    color: colors.accent,
    fontSize: typography.caption,
    fontWeight: '700',
  },
});
