import { AppNavigator } from './AppNavigator';
import { SetupNavigator } from './SetupNavigator';
import { useConfigStatus } from '../config/ConfigStatusContext';

export function RootNavigator() {
  const { status } = useConfigStatus();

  if (status === 'present') {
    return <AppNavigator />;
  }

  return <SetupNavigator />;
}
