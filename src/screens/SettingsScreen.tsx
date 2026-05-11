import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, Text } from 'react-native';

import { ScreenShell } from '../components/ScreenShell';
import { isDevelopmentBuild } from '../config/environment';
import { AppStackParamList, SetupStackParamList } from '../navigation/types';
import { FeedbackBanner } from './settings/FeedbackBanner';
import { LocalMockHelper } from './settings/LocalMockHelper';
import { PushSettingsSection } from './settings/PushSettingsSection';
import { SettingsField } from './settings/SettingsField';
import { styles } from './settings/SettingsScreen.styles';
import { useSettingsController } from './settings/useSettingsController';

type SetupProps = NativeStackScreenProps<SetupStackParamList, 'Settings'>;
type AppProps = NativeStackScreenProps<AppStackParamList, 'Settings'>;

type Props = SetupProps | AppProps;

export function SettingsScreen({ navigation }: Props) {
  const { control, errors, showToken, saving, clearing, isOffline, feedback, onSaveAndTest, onClearConfig, toggleTokenVisibility } =
    useSettingsController({ navigation });

  const saveDisabled = saving || clearing || isOffline;

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

      {isDevelopmentBuild() ? <LocalMockHelper /> : null}

      <PushSettingsSection />

      <FeedbackBanner feedback={feedback} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Save and Test settings"
        accessibilityState={{ disabled: saveDisabled }}
        style={[styles.primaryButton, saveDisabled ? styles.disabledButton : null]}
        onPress={onSaveAndTest}
        disabled={saveDisabled}
      >
        <Text style={styles.primaryButtonText}>{saving ? 'Saving and testing...' : isOffline ? 'Offline - reconnect to test' : 'Save and Test'}</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Clear Config"
        accessibilityState={{ disabled: saving || clearing }}
        style={[styles.secondaryButton, (saving || clearing) ? styles.disabledButton : null]}
        onPress={onClearConfig}
        disabled={saving || clearing}
      >
        <Text style={styles.secondaryButtonText}>{clearing ? 'Clearing...' : 'Clear Config'}</Text>
      </Pressable>
    </ScreenShell>
  );
}
