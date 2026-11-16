import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, radius, spacing, typography} from '../theme';

type Props = {
  name: string;
  message: string;
  onRetry: () => void;
  onClose: () => void;
};

/** Màn hình trắng báo không tải được mini app, có hai lựa chọn: Thử lại hoặc Đóng (về Trang chủ). */
export default function MiniAppErrorView({name, message, onRetry, onClose}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Không tải được {name}</Text>
      <Text style={styles.detail}>{message}</Text>
      {__DEV__ ? (
        <Text style={styles.hint}>
          Kiểm tra mini app đã chạy chưa: vào thư mục package và chạy `pnpm start:module`.
        </Text>
      ) : null}
      <View style={styles.actions}>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          style={[styles.button, styles.secondary]}>
          <Text style={styles.secondaryText}>Đóng</Text>
        </Pressable>
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          style={[styles.button, styles.primary]}>
          <Text style={styles.primaryText}>Thử lại</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.surface,
  },
  title: {...typography.title, color: colors.textPrimary, textAlign: 'center'},
  detail: {
    ...typography.caption,
    marginTop: spacing.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  hint: {
    ...typography.caption,
    marginTop: spacing.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl},
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.pill,
  },
  primary: {backgroundColor: colors.primaryLight},
  primaryText: {...typography.body, color: colors.textOnPrimary, fontWeight: '700'},
  secondary: {backgroundColor: colors.background},
  secondaryText: {...typography.body, color: colors.textPrimary, fontWeight: '700'},
});
