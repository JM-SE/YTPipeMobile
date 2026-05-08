import { fireEvent, render, screen } from '@testing-library/react-native';

import { DashboardScreen } from '../screens/DashboardScreen';

jest.mock('../api/useStatusQuery', () => ({
  useStatusQuery: jest.fn(),
}));

jest.mock('../api/useManualActionsMutations', () => ({
  useSyncSubscriptionsMutation: jest.fn(),
  useRunPollMutation: jest.fn(),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  useBottomTabBarHeight: () => 56,
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

const { useStatusQuery } = jest.requireMock('../api/useStatusQuery') as {
  useStatusQuery: jest.Mock;
};

const { useSyncSubscriptionsMutation, useRunPollMutation } = jest.requireMock('../api/useManualActionsMutations') as {
  useSyncSubscriptionsMutation: jest.Mock;
  useRunPollMutation: jest.Mock;
};

const baseStatus = {
  service: 'ytpipe',
  environment: 'mock',
  ready: true,
  subscription_sync: { last_success_at: null, last_error_at: null, last_error_message: null, metadata: {} },
  polling: {
    last_success_at: '2026-05-01T10:00:00.000Z',
    last_error_at: null,
    last_error_message: null,
    last_run: { run_outcome: 'success', channels_processed: 2, channels_failed: 0, baselines_established: 1, new_videos_detected: 1, quota_blocked: false },
  },
  email: {
    last_attempt_at: '2026-05-01T10:01:00.000Z',
    last_success_at: '2026-05-01T10:01:00.000Z',
    last_failure_at: null,
    last_error: null,
    pending_count: 0,
    pending_retry_count: 0,
    delivered_count: 1,
    failed_count: 0,
  },
  quota: {
    daily_quota_budget: 500,
    estimated_units_used_today: 100,
    last_run_estimated_units: 5,
    safety_stop_active: false,
    safety_stop_enabled: true,
    safety_stop_triggered_at: null,
  },
  channels: { imported_count: 12, monitored_count: 3 },
};

describe('DashboardScreen phase 3', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSyncSubscriptionsMutation.mockReturnValue({ isPending: false, mutate: jest.fn() });
    useRunPollMutation.mockReturnValue({ isPending: false, mutate: jest.fn() });
  });

  it('renders dashboard cards and manual actions', () => {
    useStatusQuery.mockReturnValue({
      data: baseStatus,
      error: null,
      isLoading: false,
      isFetching: false,
      isRefetchError: false,
      refetch: jest.fn(),
    });

    render(<DashboardScreen />);

    expect(screen.getByText('Service readiness')).toBeTruthy();
    expect(screen.getByText('Polling summary')).toBeTruthy();
    expect(screen.queryByText('Email/delivery summary')).toBeNull();
    expect(screen.getByText('Quota/safety')).toBeTruthy();
    expect(screen.getByText('Channel summary')).toBeTruthy();
    expect(screen.getByText('Manual actions')).toBeTruthy();
    expect(screen.getByLabelText('Sync subscriptions')).toBeTruthy();
    expect(screen.getByLabelText('Run poll')).toBeTruthy();
  });

  it('wires refresh actions to refetch', () => {
    const refetch = jest.fn();
    useStatusQuery.mockReturnValue({
      data: baseStatus,
      error: null,
      isLoading: false,
      isFetching: false,
      isRefetchError: false,
      refetch,
    });

    render(<DashboardScreen />);

    fireEvent.press(screen.getByLabelText('Retry status'));
    expect(refetch).toHaveBeenCalled();
  });

  it('opens Settings from auth/config errors', () => {
    useStatusQuery.mockReturnValue({
      data: null,
      error: { kind: 'auth', message: 'Authentication failed', status: 401 },
      isLoading: false,
      isFetching: false,
      isRefetchError: false,
      refetch: jest.fn(),
    });

    render(<DashboardScreen />);

    fireEvent.press(screen.getByLabelText('Open Settings'));

    expect(mockNavigate).toHaveBeenCalledWith('Settings');
  });
});
