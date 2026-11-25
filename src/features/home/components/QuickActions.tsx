import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Ionicons} from '@react-native-vector-icons/ionicons/static';
import {colors, radius, shadow, spacing, typography} from '../../../shared/theme';
import {HomeItem, QuickAction} from '../types';

type Props = {
  actions: QuickAction[];
  onPressItem: (item: HomeItem) => void;
};

/** Hàng thao tác nhanh: mỗi nút một màu, biểu tượng nằm trong vòng tròn có viền mờ. */
export default function QuickActions({actions, onPressItem}: Props) {
  return (
    <View style={[styles.card, shadow]}>
      {actions.map(({item, tint}) => (
        <Pressable
          key={item.key}
          onPress={() => onPressItem(item)}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          style={({pressed}) => [styles.action, pressed && styles.pressed]}>
          <View style={[styles.ring, {borderColor: `${tint}22`}]}>
            <View style={[styles.circle, {backgroundColor: tint}]}>
              <Ionicons name={item.icon} size={24} color={colors.textOnPrimary} />
            </View>
          </View>
          <Text style={styles.label} numberOfLines={1}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  action: {flex: 1, alignItems: 'center'},
  pressed: {opacity: 0.7, transform: [{scale: 0.96}]},
  ring: {width: 64, height: 64, borderRadius: 32, borderWidth: 5, alignItems: 'center', justifyContent: 'center'},
  circle: {width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center'},
  label: {...typography.caption, marginTop: spacing.sm, color: colors.textPrimary, fontWeight: '700'},
});
