import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text } from 'react-native';

import { ScreenShell } from '../components/ScreenShell';
import { SetupStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<SetupStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <ScreenShell
      title="Welcome to YTPipe Mobile"
      subtitle="Personal admin companion app. Configure API base URL and mobile token to continue."
    >
      <Text style={styles.note}>This app never uses INTERNAL_API_BEARER_TOKEN.</Text>

      <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Settings')}>
        <Text style={styles.primaryButtonText}>Go to setup</Text>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  note: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  primaryButtonText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
