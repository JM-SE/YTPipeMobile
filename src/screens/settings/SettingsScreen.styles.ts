import { StyleSheet } from 'react-native';

import { colors, spacing, typography } from '../../theme/tokens';

export const styles = StyleSheet.create({
  card: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  input: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    backgroundColor: '#0D152B',
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.caption,
  },
  helperCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  helperTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  feedbackCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
  },
  feedbackSuccess: {
    borderColor: colors.success,
    backgroundColor: '#123126',
  },
  feedbackError: {
    borderColor: colors.danger,
    backgroundColor: '#2B1218',
  },
  feedbackText: {
    color: colors.textPrimary,
    fontSize: typography.body,
  },
  linkButton: {
    alignSelf: 'flex-start',
  },
  linkButtonText: {
    color: colors.accent,
    fontSize: typography.caption,
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
  secondaryButton: {
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
