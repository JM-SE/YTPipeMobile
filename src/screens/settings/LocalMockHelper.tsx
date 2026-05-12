import { Text, View } from 'react-native';

import { styles } from './SettingsScreen.styles';

export function LocalMockHelper() {
  return (
    <View style={styles.helperCard}>
      <Text style={styles.helperTitle}>Local mock helper</Text>
      <Text style={styles.helperText}>Android Emulator base URL: http://10.0.2.2:4000 (use 10.0.2.2, not 10.2.2.2)</Text>
      <Text style={styles.helperText}>Genymotion base URL: http://10.0.3.2:4000</Text>
      <Text style={styles.helperText}>Host/web base URL: http://localhost:4000</Text>
      <Text style={styles.helperText}>Mock token: dev-mobile-token</Text>
    </View>
  );
}
