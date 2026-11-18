import React from 'react';
import {Image, ImageSourcePropType, StyleSheet, Text, View} from 'react-native';
import {colors} from '../theme';

type Props = {
  name: string;
  uri?: string;
  source?: ImageSourcePropType; // ảnh local (require), ưu tiên hơn uri
  size?: number;
};

/** Ảnh đại diện; nếu không có ảnh thì hiện chữ cái đầu của tên. */
export default function Avatar({name, uri, source, size = 48}: Props) {
  const box = {width: size, height: size, borderRadius: size / 2};

  const imageSource = source ?? (uri ? {uri} : undefined);
  if (imageSource) {
    return <Image source={imageSource} style={[styles.base, box]} />;
  }

  const initial = name.trim().split(' ').pop()?.charAt(0).toUpperCase() ?? '?';
  return (
    <View style={[styles.base, styles.fallback, box]}>
      <Text style={[styles.initial, {fontSize: size * 0.42}]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {borderWidth: 2, borderColor: colors.onPrimaryBorder},
  fallback: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {color: colors.textOnPrimary, fontWeight: '700'},
});
