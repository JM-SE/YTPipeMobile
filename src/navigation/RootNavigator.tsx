import { AppNavigator } from './AppNavigator';
import { SetupNavigator } from './SetupNavigator';
import { useConfigStatus } from '../config/ConfigStatusContext';
import { ScreenShell } from '../components/ScreenShell';

export function RootNavigator() {
  const { status } = useConfigStatus();

  if (status === 'loading') {
    return <ScreenShell title="YTPipe Mobile" subtitle="Loading local configuration..." />;
  }

  if (status === 'error') {
    return <ScreenShell title="YTPipe Mobile" subtitle="Failed to load local configuration." />;
  }

  if (status === 'present') {
    return <AppNavigator />;
  }

  return <SetupNavigator />;
}
