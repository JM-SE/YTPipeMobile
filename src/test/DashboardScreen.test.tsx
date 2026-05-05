import { fireEvent, render, screen } from '@testing-library/react-native';

import { DashboardScreen } from '../screens/DashboardScreen';

jest.mock('../components/ConnectionDiagnosticCard', () => ({
  ConnectionDiagnosticCard: () => {
    const { Pressable, Text, View } = require('react-native');
    return (
      <View>
        <Text>Connection diagnostic</Text>
        <Text>Refresh failed, showing stale status. You can retry.</Text>
        <Pressable onPress={() => null}>
          <Text>Show details</Text>
        </Pressable>
      </View>
    );
  },
}));

describe('DashboardScreen phase 2', () => {
  it('renders connection diagnostic and phase-5 manual actions placeholder', () => {
    render(<DashboardScreen />);

    expect(screen.getByText('Connection diagnostic')).toBeTruthy();
    expect(screen.getByText(/Manual actions \(Sync\/Poll\) will live here in Phase 5/i)).toBeTruthy();
  });

  it('shows details action in diagnostic', () => {
    render(<DashboardScreen />);
    fireEvent.press(screen.getByText('Show details'));
  });
});
