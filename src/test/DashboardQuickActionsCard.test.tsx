import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ApiError } from '../api/errors';
import { DashboardQuickActionsCard } from '../components/dashboard/DashboardQuickActionsCard';

jest.mock('../api/useManualActionsMutations', () => ({
  useSyncSubscriptionsMutation: jest.fn(),
  useRunPollMutation: jest.fn(),
}));

jest.mock('../connectivity/ConnectivityContext', () => ({
  useConnectivityStatus: jest.fn(),
}));

const { useSyncSubscriptionsMutation, useRunPollMutation } = jest.requireMock('../api/useManualActionsMutations') as {
  useSyncSubscriptionsMutation: jest.Mock;
  useRunPollMutation: jest.Mock;
};

const { useConnectivityStatus } = jest.requireMock('../connectivity/ConnectivityContext') as {
  useConnectivityStatus: jest.Mock;
};

function mockMutations(params: {
  syncPending?: boolean;
  pollPending?: boolean;
  syncMutate?: jest.Mock;
  pollMutate?: jest.Mock;
} = {}) {
  useSyncSubscriptionsMutation.mockReturnValue({
    isPending: params.syncPending ?? false,
    mutate: params.syncMutate ?? jest.fn(),
  });
  useRunPollMutation.mockReturnValue({
    isPending: params.pollPending ?? false,
    mutate: params.pollMutate ?? jest.fn(),
  });
}

describe('DashboardQuickActionsCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useConnectivityStatus.mockReturnValue({ isOffline: false });
    mockMutations();
  });

  it('renders executable manual actions and education copy', () => {
    render(<DashboardQuickActionsCard />);

    expect(screen.getByText('Manual actions')).toBeTruthy();
    expect(screen.getByLabelText('Sync subscriptions')).toBeTruthy();
    expect(screen.getByLabelText('Run poll')).toBeTruthy();
    expect(screen.getByText(/does not enable monitoring/i)).toBeTruthy();
    expect(screen.getByText(/may consume quota/i)).toBeTruthy();
  });

  it('disables both buttons while one action is pending', () => {
    mockMutations({ syncPending: true });

    render(<DashboardQuickActionsCard />);

    expect(screen.getByLabelText('Sync subscriptions')).toBeDisabled();
    expect(screen.getByLabelText('Run poll')).toBeDisabled();
  });

  it('disables both buttons while offline', () => {
    useConnectivityStatus.mockReturnValue({ isOffline: true });

    render(<DashboardQuickActionsCard />);

    expect(screen.getByLabelText('Sync subscriptions')).toBeDisabled();
    expect(screen.getByLabelText('Run poll')).toBeDisabled();
    expect(screen.getByText('Manual actions are disabled while offline.')).toBeTruthy();
  });

  it('shows compact sync success feedback', async () => {
    const syncMutate = jest.fn((_variables, options) => {
      options.onSuccess({ status: 'ok', channels_imported: 5, channels_created: 2, channels_updated: 3 });
      options.onSettled();
    });
    mockMutations({ syncMutate });

    render(<DashboardQuickActionsCard />);

    fireEvent.press(screen.getByLabelText('Sync subscriptions'));

    await waitFor(() => {
      expect(screen.getByText('Sync complete')).toBeTruthy();
      expect(screen.getByText(/imported 5/i)).toBeTruthy();
      expect(screen.getByText(/created 2/i)).toBeTruthy();
      expect(screen.getByText(/updated 3/i)).toBeTruthy();
    });
  });

  it('shows compact poll success and quota alert', async () => {
    const pollMutate = jest.fn((_variables, options) => {
      options.onSuccess({
        run_outcome: 'quota_blocked',
        channels_processed: 1,
        channels_failed: 0,
        baselines_established: 0,
        new_videos_detected: 0,
        quota_blocked: true,
      });
      options.onSettled();
    });
    mockMutations({ pollMutate });

    render(<DashboardQuickActionsCard />);

    fireEvent.press(screen.getByLabelText('Run poll'));

    await waitFor(() => {
      expect(screen.getByText('Poll complete')).toBeTruthy();
      expect(screen.getByText(/quota_blocked/i)).toBeTruthy();
      expect(screen.getByText('Quota/safety alert')).toBeTruthy();
      expect(screen.getByText(/Avoid aggressive retries/i)).toBeTruthy();
    });
  });

  it('shows OAuth-specific sync error copy', async () => {
    const syncMutate = jest.fn((_variables, options) => {
      options.onError(new ApiError({ kind: 'unknown', status: 409, message: 'Prerequisite missing' }));
      options.onSettled();
    });
    mockMutations({ syncMutate });

    render(<DashboardQuickActionsCard />);

    fireEvent.press(screen.getByLabelText('Sync subscriptions'));

    await waitFor(() => {
      expect(screen.getByText(/backend Google OAuth authorization may need to be completed/i)).toBeTruthy();
    });
  });
});
