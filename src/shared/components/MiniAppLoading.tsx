import React, {ComponentProps, useEffect, useState} from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useAnimatedValue,
  useWindowDimensions,
  View,
} from 'react-native';
import {Ionicons} from '@react-native-vector-icons/ionicons/static';
import {LOGO} from '../../assets/images';
import {colors, radius, spacing} from '../theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  name: string;
  icon: IconName;
  /** Kết quả tải đã về (thành công hoặc lỗi): thanh tiến trình chạy nốt tới 100% rồi cả màn mờ dần. */
  done: boolean;
  /** Gọi khi màn loading đã mờ hẳn, lúc đó nên gỡ nó khỏi cây giao diện. */
  onHidden: () => void;
  onClose: () => void;
  topInset: number;
  bottomInset: number;
};

const NAVY = '#061A4A'; // nền tối hơn primary để các vầng sáng nổi lên
const TILE = 96;
const RING_INNER = 136;
const RING_OUTER = 168;
const TRACK_W = 168;
const STATUS = ['Đang kết nối máy chủ', 'Đang tải dữ liệu', 'Đang chuẩn bị giao diện'];
const STATUS_STEP_MS = 1000;

const turn = (v: Animated.Value, reverse = false) =>
  v.interpolate({inputRange: [0, 1], outputRange: reverse ? ['360deg', '0deg'] : ['0deg', '360deg']});

/**
 * Màn chờ khi đang tải mini app, phủ toàn màn hình:
 * nền xanh đậm có vầng sáng trôi chậm, biểu tượng module trong ô kính, hai vòng cung xoay ngược chiều,
 * sóng lan tỏa, chữ trạng thái đổi dần và thanh tiến trình có vệt sáng chạy qua.
 * Khi `done` bật, thanh chạy tới 100%, phần giữa phóng nhẹ rồi cả màn mờ đi để lộ mini app (hoặc màn lỗi) phía dưới.
 */
export default function MiniAppLoading({name, icon, done, onHidden, onClose, topInset, bottomInset}: Props) {
  const {width} = useWindowDimensions();
  const intro = useAnimatedValue(0);
  const outro = useAnimatedValue(0);
  const spin = useAnimatedValue(0);
  const spinSlow = useAnimatedValue(0);
  const ripple = useAnimatedValue(0);
  const breathe = useAnimatedValue(0);
  const drift = useAnimatedValue(0);
  const progress = useAnimatedValue(0);
  const shimmer = useAnimatedValue(0);
  const statusOpacity = useAnimatedValue(1);
  const [statusIndex, setStatusIndex] = useState(0);

  // Các hiệu ứng chạy liên tục trong lúc chờ.
  useEffect(() => {
    const timing = (v: Animated.Value, toValue: number, duration: number, easing = Easing.linear) =>
      Animated.timing(v, {toValue, duration, easing, useNativeDriver: true});
    const swing = (v: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          timing(v, 1, duration, Easing.inOut(Easing.sin)),
          timing(v, 0, duration, Easing.inOut(Easing.sin)),
        ]),
      );

    const anims = [
      timing(intro, 1, 700, Easing.out(Easing.back(1.4))),
      Animated.loop(timing(spin, 1, 1100)),
      Animated.loop(timing(spinSlow, 1, 2600)),
      Animated.loop(timing(ripple, 1, 2400)),
      Animated.loop(timing(shimmer, 1, 1400, Easing.inOut(Easing.quad))),
      swing(breathe, 1200),
      swing(drift, 5000),
      // Tiến trình "ước lượng": nhanh lúc đầu, chậm dần và dừng ở 88% cho tới khi tải xong thật.
      timing(progress, 0.88, 4000, Easing.out(Easing.cubic)),
    ];
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, [intro, spin, spinSlow, ripple, shimmer, breathe, drift, progress]);

  // Chữ trạng thái đổi lần lượt, dừng ở dòng cuối.
  useEffect(() => {
    if (done) {
      return;
    }
    const id = setInterval(() => {
      Animated.timing(statusOpacity, {toValue: 0, duration: 160, useNativeDriver: true}).start(() => {
        setStatusIndex(i => Math.min(i + 1, STATUS.length - 1));
        Animated.timing(statusOpacity, {toValue: 1, duration: 240, useNativeDriver: true}).start();
      });
    }, STATUS_STEP_MS);
    return () => clearInterval(id);
  }, [done, statusOpacity]);

  // Kết thúc: tiến trình tới 100% rồi mờ dần.
  useEffect(() => {
    if (!done) {
      return;
    }
    const seq = Animated.sequence([
      Animated.timing(progress, {toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true}),
      Animated.timing(outro, {toValue: 1, duration: 420, easing: Easing.in(Easing.cubic), useNativeDriver: true}),
    ]);
    seq.start(({finished}) => {
      if (finished) {
        onHidden();
      }
    });
    return () => seq.stop();
  }, [done, onHidden, outro, progress]);

  const fadeOut = outro.interpolate({inputRange: [0, 1], outputRange: [1, 0]});
  const driftA = drift.interpolate({inputRange: [0, 1], outputRange: [-30, 30]});
  const driftB = drift.interpolate({inputRange: [0, 1], outputRange: [24, -24]});

  return (
    <Animated.View
      style={[styles.container, {opacity: fadeOut}]}
      accessibilityRole="progressbar"
      accessibilityLabel={`Đang tải ${name}`}>
      {/* Vầng sáng nền */}
      <Animated.View
        style={[
          styles.glowA,
          {transform: [{translateX: driftA}, {translateY: driftB}]},
        ]}>
        <Glow size={width * 1.3} color={colors.primaryLight} strength={0.11} />
      </Animated.View>
      <Animated.View
        style={[
          styles.glowB,
          {transform: [{translateX: driftB}, {translateY: driftA}]},
        ]}>
        <Glow size={width * 1.1} color={colors.accent} strength={0.05} />
      </Animated.View>

      {/* Phần giữa: biểu tượng + vòng xoay */}
      <Animated.View
        style={[
          styles.center,
          {
            opacity: intro.interpolate({inputRange: [0, 0.4, 1], outputRange: [0, 1, 1]}),
            transform: [
              {scale: intro.interpolate({inputRange: [0, 1], outputRange: [0.7, 1]})},
              {scale: outro.interpolate({inputRange: [0, 1], outputRange: [1, 1.2]})},
            ],
          },
        ]}>
        <View style={styles.stage}>
          {[0, 1, 2].map(i => {
            const phase = Animated.modulo(Animated.add(ripple, i / 3), 1);
            return (
              <Animated.View
                key={i}
                style={[
                  styles.ripple,
                  {
                    opacity: phase.interpolate({inputRange: [0, 1], outputRange: [0.35, 0]}),
                    transform: [{scale: phase.interpolate({inputRange: [0, 1], outputRange: [1, 2.2]})}],
                  },
                ]}
              />
            );
          })}

          <Animated.View style={[styles.ringInner, {transform: [{rotate: turn(spin)}]}]} />
          <Animated.View style={[styles.ringOuter, {transform: [{rotate: turn(spinSlow, true)}]}]} />
          <Animated.View style={[styles.orbit, {transform: [{rotate: turn(spinSlow)}]}]}>
            <View style={styles.orbitDot} />
          </Animated.View>

          <Animated.View
            style={[
              styles.tile,
              {transform: [{scale: breathe.interpolate({inputRange: [0, 1], outputRange: [1, 1.06]})}]},
            ]}>
            <View style={styles.tileShine} />
            <Ionicons name={icon} size={42} color={colors.textOnPrimary} />
          </Animated.View>
        </View>

        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Animated.Text style={[styles.status, {opacity: statusOpacity}]}>
          {STATUS[statusIndex]}
        </Animated.Text>

        <View style={styles.track}>
          <Animated.View style={[styles.fill, {transform: [{scaleX: progress}]}]} />
          <Animated.View
            style={[
              styles.gleam,
              {
                transform: [
                  {translateX: shimmer.interpolate({inputRange: [0, 1], outputRange: [-60, TRACK_W]})},
                ],
              },
            ]}
          />
        </View>
      </Animated.View>

      {/* Nút đóng: cho phép hủy khi mạng chậm */}
      <Pressable
        onPress={onClose}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Đóng, về Trang chủ"
        style={({pressed}) => [styles.close, {top: topInset + spacing.sm}, pressed && styles.closePressed]}>
        <Ionicons name="close" size={22} color={colors.textOnPrimary} />
      </Pressable>

      {/* Chân trang thương hiệu */}
      <Animated.View style={[styles.footer, {bottom: bottomInset + spacing.xl, opacity: intro}]}>
        <Image source={LOGO} style={styles.footerLogo} resizeMode="contain" />
        <Text style={styles.footerText}>ElectroGo</Text>
        <View style={styles.footerDivider} />
        <Ionicons name="shield-checkmark" size={12} color={colors.onPrimaryMuted} />
        <Text style={styles.footerText}>Kết nối bảo mật</Text>
      </Animated.View>
    </Animated.View>
  );
}

/** Vầng sáng tròn mềm: chồng nhiều vòng đồng tâm mờ để giả hiệu ứng blur (không cần thư viện gradient). */
function Glow({size, color, strength}: {size: number; color: string; strength: number}) {
  return (
    <View style={{width: size, height: size, alignItems: 'center', justifyContent: 'center'}}>
      {[1, 0.82, 0.64, 0.46, 0.3].map(k => (
        <View
          key={k}
          style={{
            position: 'absolute',
            width: size * k,
            height: size * k,
            borderRadius: (size * k) / 2,
            backgroundColor: color,
            opacity: strength,
          }}
        />
      ))}
    </View>
  );
}

const ring = {
  position: 'absolute' as const,
  borderRadius: radius.pill,
  borderColor: 'transparent',
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glowA: {position: 'absolute', top: '-30%', left: '-40%'},
  glowB: {position: 'absolute', bottom: '-35%', right: '-45%'},
  center: {alignItems: 'center', marginTop: -spacing.xxl},
  stage: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: TILE + 16,
    height: TILE + 16,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  ringInner: {
    ...ring,
    width: RING_INNER,
    height: RING_INNER,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.08)',
    borderTopColor: colors.textOnPrimary,
    borderRightColor: 'rgba(255,255,255,0.45)',
  },
  ringOuter: {
    ...ring,
    width: RING_OUTER,
    height: RING_OUTER,
    borderWidth: 2,
    borderBottomColor: colors.accent,
    borderLeftColor: 'rgba(255,154,31,0.35)',
  },
  orbit: {
    position: 'absolute',
    width: RING_OUTER + 20,
    height: RING_OUTER + 20,
    alignItems: 'center',
  },
  orbitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 0},
  },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  tileShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: TILE / 2,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  name: {
    marginTop: spacing.xxl,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: colors.textOnPrimary,
    maxWidth: 300,
  },
  status: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
    color: colors.onPrimaryMuted,
  },
  track: {
    width: TRACK_W,
    height: 4,
    marginTop: spacing.xl,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },
  fill: {
    ...StyleSheet.absoluteFill,
    borderRadius: 2,
    backgroundColor: colors.accent,
    transformOrigin: 'left',
  },
  gleam: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  close: {
    position: 'absolute',
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  closePressed: {opacity: 0.6},
  footer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerLogo: {width: 18, height: 18},
  footerText: {fontSize: 12, fontWeight: '600', color: colors.onPrimaryMuted},
  footerDivider: {
    width: 1,
    height: 12,
    marginHorizontal: 4,
    backgroundColor: colors.onPrimaryBorder,
  },
});
