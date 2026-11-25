import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Ionicons} from '@react-native-vector-icons/ionicons/static';
import {colors, radius, shadow, spacing, typography} from '../../../shared/theme';
import {NewsItem} from '../types';

type Props = {
  items: NewsItem[];
  onPressItem?: (item: NewsItem) => void;
};

/** Danh sách tin mới, mỗi dòng một tin. */
export default function NewsList({items, onPressItem}: Props) {
  return (
    <View style={[styles.card, shadow]}>
      <Text style={styles.heading}>Tin mới</Text>
      {items.map((item, index) => (
        <Pressable
          key={item.key}
          onPress={() => onPressItem?.(item)}
          accessibilityRole="button"
          style={({pressed}) => [styles.row, index > 0 && styles.rowDivider, pressed && styles.pressed]}>
          <View style={styles.iconBox}>
            <Ionicons name={item.icon} size={20} color={colors.primaryLight} />
          </View>
          <View style={styles.texts}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg},
  heading: {...typography.title, color: colors.textPrimary, marginBottom: spacing.xs},
  row: {flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md},
  rowDivider: {borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.iconTile},
  pressed: {opacity: 0.7},
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.iconTile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {flex: 1, marginLeft: spacing.md},
  title: {...typography.body, color: colors.textPrimary, fontWeight: '600'},
  time: {...typography.caption, color: colors.textSecondary, marginTop: 2},
});
