import type { ApiError } from '../../api/errors';
import type { PollResult, SyncResult } from '../../api/types';

export function formatSyncSuccess(result: SyncResult) {
  const parts = [`Status: ${result.status}`];

  if (result.channels_imported !== undefined) parts.push(`imported ${result.channels_imported}`);
  if (result.channels_created !== undefined) parts.push(`created ${result.channels_created}`);
  if (result.channels_updated !== undefined) parts.push(`updated ${result.channels_updated}`);

  return `Sync subscriptions completed. ${parts.join(' · ')}.`;
}

export function formatPollSuccess(result: PollResult) {
  const parts = [
    `Outcome: ${result.run_outcome}`,
    `processed ${result.channels_processed}`,
    `failed ${result.channels_failed}`,
    `baselines ${result.baselines_established}`,
    `new videos ${result.new_videos_detected}`,
  ];

  if (result.quota_blocked) {
    parts.push('quota blocked');
  }

  return `Run poll completed. ${parts.join(' · ')}.`;
}

export function quotaBlockedMessage() {
  return 'Quota or safety stop is active. Avoid aggressive retries; polling may be temporarily blocked to protect YouTube/API quota.';
}

export function formatManualActionError(action: 'sync' | 'poll', error: ApiError) {
  const detail = `${error.detail ?? ''} ${error.technical ?? ''} ${error.message}`.toLowerCase();

  if (action === 'sync' && (error.status === 409 || detail.includes('oauth') || detail.includes('prerequisite'))) {
    return 'Sync could not run because backend Google OAuth authorization may need to be completed. Check the backend/admin setup, then try again.';
  }

  return error.message;
}
