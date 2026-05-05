import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, Text } from 'react-native';

import { ScreenShell } from '../components/ScreenShell';
import { AppStackParamList, SetupStackParamList } from '../navigation/types';
import { FeedbackBanner } from './settings/FeedbackBanner';
import { LocalMockHelper } from './settings/LocalMockHelper';
import { SettingsField } from './settings/SettingsField';
import { styles } from './settings/SettingsScreen.styles';
import { useSettingsController } from './settings/useSettingsController';

type SetupProps = NativeStackScreenProps<SetupStackParamList, 'Settings'>;
type AppProps = NativeStackScreenProps<AppStackParamList, 'Settings'>;

type Props = SetupProps | AppProps;

export function SettingsScreen({ navigation }: Props) {
  const { control, errors, showToken, saving, clearing, feedback, onSaveAndTest, onClearConfig, toggleTokenVisibility } =
    useSettingsController({ navigation });

  return (
    <ScreenShell title="Settings" subtitle="Configure backend URL and mobile API token.">
      <SettingsField
        control={control}
        errors={errors}
        name="apiBaseUrl"
        label="API base URL"
        placeholder="https://your-backend.example.com"
      />

      <SettingsField
        control={control}
        errors={errors}
        name="mobileApiToken"
        label="Mobile API token"
        placeholder="MOBILE_API_BEARER_TOKEN"
        secureTextEntry={!showToken}
        showHideLabel={showToken ? 'Hide token' : 'Show token'}
        onToggleShowHide={toggleTokenVisibility}
      />

      <LocalMockHelper />

      <FeedbackBanner feedback={feedback} />

      <Pressable
        style={[styles.primaryButton, (saving || clearing) ? styles.disabledButton : null]}
        onPress={onSaveAndTest}
        disabled={saving || clearing}
      >
        <Text style={styles.primaryButtonText}>{saving ? 'Saving and testing...' : 'Save and Test'}</Text>
      </Pressable>

      <Pressable
        style={[styles.secondaryButton, (saving || clearing) ? styles.disabledButton : null]}
        onPress={onClearConfig}
        disabled={saving || clearing}
      >
        <Text style={styles.secondaryButtonText}>{clearing ? 'Clearing...' : 'Clear Config'}</Text>
      </Pressable>
    </ScreenShell>
  );
}
