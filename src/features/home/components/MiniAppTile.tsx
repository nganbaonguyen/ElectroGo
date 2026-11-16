import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, radius, spacing, typography} from '../../../shared/theme';
import {MiniAppItem} from '../types';

type Props = {
  item: MiniAppItem;
  onPress: (item: MiniAppItem) => void;
};

export default function MiniAppTile({item, onPress}: Props) {
  return (
    <Pressable
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      style={({pressed}) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{item.icon}</Text>
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
    backgroundColor: colors.iconTile,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {fontSize: 28},
  label: {
    ...typography.caption,
    marginTop: spacing.sm,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
