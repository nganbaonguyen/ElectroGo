import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, radius, shadow, spacing, typography} from '../../../shared/theme';
import {HomeSection, HomeItem} from '../types';
import MiniAppGrid from './MiniAppGrid';

type Props = {
  section: HomeSection;
  onPressItem: (item: HomeItem) => void;
};

/** Một nhóm menu: tiêu đề và lưới ô trong một thẻ trắng. */
export default function MenuSection({section, onPressItem}: Props) {
  return (
    <View style={[styles.card, shadow]}>
      <View style={styles.titleRow}>
        <View style={[styles.bar, {backgroundColor: section.accent}]} />
        <Text style={styles.title}>{section.title}</Text>
      </View>
      <MiniAppGrid
        items={section.items}
        onPressItem={onPressItem}
        accent={section.accent}
        accentBg={section.accentBg}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg},
  titleRow: {flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm},
  bar: {width: 4, height: 18, borderRadius: 2, marginRight: spacing.sm},
  title: {...typography.title, color: colors.textPrimary},
});
