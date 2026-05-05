import { Text } from 'react-native';

import { ConnectionDiagnosticCard } from '../components/ConnectionDiagnosticCard';
import { ScreenShell } from '../components/ScreenShell';

export function DashboardScreen() {
  return (
    <ScreenShell
      title="Dashboard"
      subtitle="Phase 2 connection diagnostic. Full status dashboard arrives in Phase 3."
    >
      <ConnectionDiagnosticCard />
      <Text style={{ color: '#9AA7CC' }}>Manual actions (Sync/Poll) will live here in Phase 5.</Text>
    </ScreenShell>
  );
}
