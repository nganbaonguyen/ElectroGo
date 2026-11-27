import React, {useEffect, useState} from 'react';
import {Animated, Easing, Pressable, StyleSheet, Text, useAnimatedValue, View} from 'react-native';
import {Ionicons} from '@react-native-vector-icons/ionicons/static';
import {colors, GUTTER, radius, shadow, spacing} from '../shared/theme';
import {applyOtaUpdate, OtaPhase, useOtaState} from './ota';

const NAVY = '#0B1F4D';

const COPY: Record<Exclude<OtaPhase, 'idle'>, {title: string; icon: 'cloud-download-outline' | 'sync-outline' | 'sparkles'}> = {
  downloading: {title: 'Đang tải bản cập nhật', icon: 'cloud-download-outline'},
  installing: {title: 'Đang chuẩn bị bản cập nhật', icon: 'sync-outline'},
  ready: {title: 'Đã có phiên bản mới', icon: 'sparkles'},
};

/**
 * Thanh cập nhật OTA nổi ở đáy Home (trên thanh tab): hiện khi đang tải bản cập nhật và khi tải xong.
 * Tải xong có nút "Cập nhật" (khởi động lại để áp dụng ngay) và nút đóng; đóng thì bản mới vẫn tự
 * áp dụng ở lần mở app sau (xem src/app/ota.tsx).
 */
export default function OtaUpdateBanner() {
  const {phase, progress} = useOtaState();
  const [dismissed, setDismissed] = useState<OtaPhase | null>(null);
  const visible = phase !== 'idle' && dismissed !== phase;
  const shown = useAnimatedValue(0);
  const bar = useAnimatedValue(0);

  // Trạng thái đổi (vd. đang tải -> tải xong) thì hiện lại dù trước đó đã đóng
  useEffect(() => {
    setDismissed(d => (d === phase ? d : null));
  }, [phase]);

  useEffect(() => {
    Animated.timing(shown, {
      toValue: visible ? 1 : 0,
      duration: visible ? 380 : 220,
      easing: visible ? Easing.out(Easing.back(1.2)) : Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [visible, shown]);

  useEffect(() => {
    Animated.timing(bar, {toValue: progress, duration: 200, useNativeDriver: true}).start();
  }, [progress, bar]);

  if (phase === 'idle') {
    return null;
  }

  const copy = COPY[phase];
  const subtitle =
    phase === 'downloading'
      ? `${Math.round(progress * 100)}% · Bạn vẫn dùng app bình thường`
      : phase === 'installing'
        ? 'Sắp xong...'
        : 'Khởi động lại để dùng ngay';

  return (
    <Animated.View
      pointerEvents={visible ? 'box-none' : 'none'}
      style={[
        styles.wrap,
        {
          opacity: shown,
          transform: [{translateY: shown.interpolate({inputRange: [0, 1], outputRange: [24, 0]})}],
        },
      ]}>
      <View style={styles.card} accessibilityLiveRegion="polite">
        <View style={[styles.icon, phase === 'ready' && styles.iconReady]}>
          <Ionicons name={copy.icon} size={20} color={phase === 'ready' ? NAVY : colors.textOnPrimary} />
        </View>

        <View style={styles.texts}>
          <Text style={styles.title} numberOfLines={1}>
            {copy.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        {phase === 'ready' && (
          <Pressable
            onPress={applyOtaUpdate}
            accessibilityRole="button"
            accessibilityLabel="Cập nhật ngay, app sẽ khởi động lại"
            style={({pressed}) => [styles.action, pressed && styles.pressed]}>
            <Text style={styles.actionText}>Cập nhật</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => setDismissed(phase)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Để sau"
          style={({pressed}) => [styles.close, pressed && styles.pressed]}>
          <Ionicons name="close" size={18} color={colors.onPrimaryMuted} />
        </Pressable>

        {phase !== 'ready' && (
          <View style={styles.track}>
            <Animated.View style={[styles.fill, {transform: [{scaleX: bar}]}]} />
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {position: 'absolute', left: GUTTER, right: GUTTER, bottom: spacing.md},
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: NAVY,
    overflow: 'hidden',
    ...shadow,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.onPrimarySoft,
  },
  iconReady: {backgroundColor: colors.accent},
  texts: {flex: 1, marginLeft: spacing.md},
  title: {fontSize: 14, lineHeight: 20, fontWeight: '700', color: colors.textOnPrimary},
  subtitle: {fontSize: 12, lineHeight: 16, color: colors.onPrimaryMuted, marginTop: 2},
  action: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  actionText: {fontSize: 13, fontWeight: '700', color: NAVY},
  close: {
    width: 32,
    height: 32,
    marginLeft: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  pressed: {opacity: 0.6},
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: colors.onPrimarySoft,
  },
  fill: {...StyleSheet.absoluteFill, backgroundColor: colors.accent, transformOrigin: 'left'},
});
