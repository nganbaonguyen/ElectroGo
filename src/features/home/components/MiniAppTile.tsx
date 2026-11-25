import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Ionicons} from '@react-native-vector-icons/ionicons/static';
import {colors, radius, spacing, typography} from '../../../shared/theme';
import {HomeItem, isMiniApp} from '../types';

type Props = {
  item: HomeItem;
  onPress: (item: HomeItem) => void;
  accent?: string; // màu biểu tượng (theo nhóm menu)
  accentBg?: string; // màu nền ô biểu tượng
};

export default function MiniAppTile({item, onPress, accent = colors.primaryLight, accentBg = colors.iconTile}: Props) {
  const comingSoon = !isMiniApp(item);

  return (
    <Pressable
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={comingSoon ? `${item.label}, sắp ra mắt` : item.label}
      style={({pressed}) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.iconBox, {backgroundColor: accentBg}, comingSoon && styles.iconBoxSoon]}>
        <Ionicons name={item.icon} size={28} color={accent} />
        {/* Chấm cam: ô này chưa có mini app, bấm vào chỉ báo "sắp ra mắt" */}
        {comingSoon && <View style={styles.soonDot} />}
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {item.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {flex: 1, alignItems: 'center'},
  pressed: {transform: [{scale: 0.95}], opacity: 0.8},
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxSoon: {opacity: 0.55},
  soonDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  label: {
    ...typography.caption,
    marginTop: spacing.sm,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
