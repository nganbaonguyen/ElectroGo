import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Ionicons} from '@react-native-vector-icons/ionicons/static';
import {colors, radius, spacing} from '../theme';

type Props = {
  /** Tên nhóm mini app đang mở, ví dụ "Nhân sự". Tên màn hình cụ thể do header của chính mini app hiển thị. */
  title: string;
  onBack: () => void;
};

const BUTTON = 36;

/**
 * Thanh trên cùng do host vẽ khi mở mini app: nút quay về Trang chủ bên trái, tên mini app ở giữa.
 * Cột phải để trống bằng đúng cột trái để tiêu đề luôn nằm chính giữa.
 */
export default function MiniAppHeader({title, onBack}: Props) {
  return (
    <View style={styles.bar}>
      <Pressable
        onPress={onBack}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Quay về Trang chủ"
        android_ripple={{color: colors.iconTile, borderless: true, radius: BUTTON / 2}}
        style={({pressed}) => [styles.button, pressed && styles.pressed]}>
        <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
      </Pressable>

      <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
        {title}
      </Text>

      <View style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(17,24,39,0.12)',
  },
  button: {
    width: BUTTON,
    height: BUTTON,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {backgroundColor: colors.background},
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
