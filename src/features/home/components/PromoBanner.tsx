import React, {useState} from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {Ionicons} from '@react-native-vector-icons/ionicons/static';
import {colors, GUTTER, radius, spacing, typography} from '../../../shared/theme';
import {Banner} from '../types';

type Props = {banners: Banner[]};

const GAP = spacing.md;

/** Dải banner chạy ngang, vuốt để chuyển, có chấm báo trang. */
export default function PromoBanner({banners}: Props) {
  const {width} = useWindowDimensions();
  const cardWidth = width - GUTTER * 2;
  const [page, setPage] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / (cardWidth + GAP)));
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + GAP}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.row}>
        {banners.map(b => (
          <View key={b.key} style={[styles.card, {width: cardWidth, backgroundColor: b.background}]}>
            <View style={styles.glow} />
            <View style={styles.texts}>
              <Text style={styles.title} numberOfLines={2}>
                {b.title}
              </Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                {b.subtitle}
              </Text>
              <View style={styles.actionPill}>
                <Text style={styles.actionText}>{b.action}</Text>
                <Ionicons name="arrow-forward" size={13} color={b.background} />
              </View>
            </View>
            <View style={styles.iconWrap}>
              <Ionicons name={b.icon} size={40} color={colors.textOnPrimary} />
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {banners.map((b, i) => (
          <View key={b.key} style={[styles.dot, i === page && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {paddingHorizontal: GUTTER, gap: GAP},
  card: {
    height: 128,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    top: -60,
    right: -40,
    backgroundColor: colors.onPrimarySoft,
  },
  texts: {flex: 1, marginRight: spacing.md},
  title: {...typography.title, color: colors.textOnPrimary},
  actionPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
    paddingVertical: 5,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.textOnPrimary,
  },
  actionText: {...typography.caption, color: colors.textPrimary, fontWeight: '700'},
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.onPrimarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {...typography.caption, color: colors.onPrimaryMuted, marginTop: spacing.xs},
  dots: {flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md, gap: spacing.xs},
  dot: {width: 6, height: 6, borderRadius: 3, backgroundColor: colors.onPrimaryBorder, opacity: 0.6},
  dotActive: {width: 18, backgroundColor: colors.primaryLight, opacity: 1},
});
