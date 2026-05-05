import { Controller, Control, FieldErrors, Path } from 'react-hook-form';
import { Pressable, Text, TextInput, View } from 'react-native';

import { ConfigFormValues } from '../../config/configSchema';
import { colors } from '../../theme/tokens';
import { styles } from './SettingsScreen.styles';

type Props = {
  control: Control<ConfigFormValues>;
  errors: FieldErrors<ConfigFormValues>;
  name: Path<ConfigFormValues>;
  label: string;
  placeholder: string;
  secureTextEntry?: boolean;
  showHideLabel?: string;
  onToggleShowHide?: () => void;
};

export function SettingsField({
  control,
  errors,
  name,
  label,
  placeholder,
  secureTextEntry,
  showHideLabel,
  onToggleShowHide,
}: Props) {
  const error = errors[name]?.message;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={secureTextEntry}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, error ? styles.inputError : null]}
          />
        )}
      />

      {showHideLabel && onToggleShowHide ? (
        <Pressable style={styles.linkButton} onPress={onToggleShowHide}>
          <Text style={styles.linkButtonText}>{showHideLabel}</Text>
        </Pressable>
      ) : null}

      {typeof error === 'string' ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}
