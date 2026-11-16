import React from 'react';
import {StyleSheet, View} from 'react-native';
import {spacing} from '../../../shared/theme';
import {MiniAppItem} from '../types';
import MiniAppTile from './MiniAppTile';

const COLUMNS = 4;

type Props = {
  items: MiniAppItem[];
  onPressItem: (item: MiniAppItem) => void;
};

/** Lưới 4 cột. Ô trống được chèn thêm để hàng cuối không bị kéo giãn. */
export default function MiniAppGrid({items, onPressItem}: Props) {
  const padding = (COLUMNS - (items.length % COLUMNS)) % COLUMNS;

  return (
    <View style={styles.grid}>
      {items.map(item => (
        <View key={item.key} style={styles.cell}>
          <MiniAppTile item={item} onPress={onPressItem} />
        </View>
      ))}
      {Array.from({length: padding}).map((_, i) => (
        <View key={`pad-${i}`} style={styles.cell} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs},
  cell: {width: '25%', paddingHorizontal: spacing.xs, paddingVertical: spacing.sm, flexDirection: 'row'},
});
