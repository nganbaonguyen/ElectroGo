import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import {colors} from '../theme';

type Props = {
  icon: string;
  label: string; // đọc bằng screen reader
  onPress?: () => void;
};

/** Nút tròn trong suốt đặt trên nền primary (dùng ở header). */
export default function IconButton({icon, label, onPress}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({pressed}) => [styles.button, pressed && styles.pressed]}>
      <Text style={styles.icon}>{icon}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.onPrimarySoft,
    borderWidth: 1,
    borderColor: colors.onPrimaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {opacity: 0.7},
  icon: {fontSize: 17},
});
