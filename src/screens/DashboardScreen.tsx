import { Text } from 'react-native';

import { ScreenShell } from '../components/ScreenShell';

export function DashboardScreen() {
  return (
    <ScreenShell
      title="Dashboard"
      subtitle="Phase 0 placeholder. Status cards and manual actions become real in later phases."
    >
      <Text style={{ color: '#9AA7CC' }}>Manual actions (Sync/Poll) will live here in Phase 5.</Text>
    </ScreenShell>
  );
}
