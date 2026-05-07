import { render, screen } from '@testing-library/react-native';

import { ConnectivityBanner } from '../components/ConnectivityBanner';

jest.mock('../connectivity/ConnectivityContext', () => ({
  useConnectivityStatus: jest.fn(),
}));

const { useConnectivityStatus } = jest.requireMock('../connectivity/ConnectivityContext') as {
  useConnectivityStatus: jest.Mock;
};

describe('ConnectivityBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a clear offline banner when disconnected', () => {
    useConnectivityStatus.mockReturnValue({ isOffline: true });

    render(<ConnectivityBanner />);

    expect(screen.getByText('Offline mode')).toBeTruthy();
    expect(screen.getByText(/Fresh API requests are paused/i)).toBeTruthy();
  });

  it('does not render while online', () => {
    useConnectivityStatus.mockReturnValue({ isOffline: false });

    render(<ConnectivityBanner />);

    expect(screen.queryByText('Offline mode')).toBeNull();
  });
});
