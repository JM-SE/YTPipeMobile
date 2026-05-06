import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../../theme/tokens';

type Props = {
  visible: boolean;
  channelTitle?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ChannelEducationModal({ visible, channelTitle, onConfirm, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Enable monitoring?</Text>
          <Text style={styles.body}>
            {channelTitle ? `${channelTitle} will become eligible for future polling. ` : ''}
            This does not notify for older videos. Future poll runs may establish a baseline first, then detect new
            videos after that baseline.
          </Text>
          <Text style={styles.body}>Only explicitly monitored channels are polled, detected, and notified.</Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={onCancel} style={[styles.button, styles.secondaryButton]}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onConfirm} style={[styles.button, styles.primaryButton]}>
              <Text style={styles.primaryButtonText}>I understand, enable monitoring</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
    width: '100%',
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.subtitle,
    fontWeight: '700',
  },
  body: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
  },
  actions: {
    gap: spacing.sm,
  },
  button: {
    borderRadius: 10,
    padding: spacing.md,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.accent,
  },
  secondaryButton: {
    borderColor: colors.border,
    borderWidth: 1,
  },
  primaryButtonText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
});
