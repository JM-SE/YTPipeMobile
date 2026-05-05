import { Text, View } from 'react-native';

import { SettingsFeedback } from './types';
import { styles } from './SettingsScreen.styles';

type Props = {
  feedback: SettingsFeedback | null;
};

export function FeedbackBanner({ feedback }: Props) {
  if (!feedback) return null;

  return (
    <View style={[styles.feedbackCard, feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError]}>
      <Text style={styles.feedbackText}>{feedback.message}</Text>
    </View>
  );
}
