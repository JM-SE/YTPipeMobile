import { fireEvent, render, screen } from '@testing-library/react-native';

import { ConnectionDiagnosticCard } from '../components/ConnectionDiagnosticCard';

jest.mock('../api/useStatusQuery', () => ({
  useStatusQuery: jest.fn(),
}));

const { useStatusQuery } = jest.requireMock('../api/useStatusQuery') as {
  useStatusQuery: jest.Mock;
};

describe('ConnectionDiagnosticCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders success state', () => {
    useStatusQuery.mockReturnValue({
      isLoading: false,
      isFetching: false,
      isError: false,
      isRefetchError: false,
      data: { environment: 'mock', ready: true },
      refetch: jest.fn(),
      error: null,
    });

    render(<ConnectionDiagnosticCard />);
    expect(screen.getByText(/Reachable and authenticated/i)).toBeTruthy();
    expect(screen.getByText(/env=mock/i)).toBeTruthy();
  });

  it('renders auth guidance and details toggle on error', () => {
    useStatusQuery.mockReturnValue({
      isLoading: false,
      isFetching: false,
      isError: true,
      isRefetchError: false,
      data: null,
      refetch: jest.fn(),
      error: { kind: 'auth', status: 401, detail: 'bad token', message: 'auth fail' },
    });

    render(<ConnectionDiagnosticCard />);
    expect(screen.getByText(/Authentication\/configuration issue/i)).toBeTruthy();
    fireEvent.press(screen.getByText('Show details'));
    expect(screen.getByText(/status=401/)).toBeTruthy();
  });

  it('shows stale warning when refetch fails with previous data', () => {
    useStatusQuery.mockReturnValue({
      isLoading: false,
      isFetching: false,
      isError: false,
      isRefetchError: true,
      data: { environment: 'mock', ready: false },
      refetch: jest.fn(),
      error: { kind: 'server', status: 503, message: 'degraded' },
    });

    render(<ConnectionDiagnosticCard />);
    expect(screen.getByText(/showing stale dashboard data/i)).toBeTruthy();
  });
});
