import React, {useRef} from 'react';
import {
  Animated,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Avatar from '../../../shared/components/Avatar';
import {colors, radius, shadow, spacing, typography} from '../../../shared/theme';
import {PROFILE} from '../data/profile';
import {ProfileUser} from '../types';

type Props = {
  user: ProfileUser;
  onClose: () => void;
};

const BAR_HEIGHT = 52; // chiều cao thanh trên cùng (nút quay lại), chưa tính tai thỏ
const HERO_BODY = 262; // phần thân hero: avatar, tên, chức danh, nhãn
const PULL_MAX = 150; // kéo xuống tối đa bao nhiêu thì avatar phóng to hết cỡ

/**
 * Hồ sơ cá nhân (chỉ thông tin liên hệ). Hero xanh co lại thành thanh nhỏ có avatar khi cuộn lên,
 * và giãn theo khi kéo xuống nên không bao giờ lộ vùng trắng phía trên.
 */
export default function ProfileScreen({user, onClose}: Props) {
  const insets = useSafeAreaInsets();
  const {height: windowHeight} = useWindowDimensions();
  const scrollY = useRef(new Animated.Value(0)).current;

  const compactHeight = insets.top + BAR_HEIGHT; // thanh khi đã co
  const heroHeight = compactHeight + HERO_BODY;
  const range = heroHeight - compactHeight; // quãng cuộn để co hoàn toàn

  // Hero dính theo nội dung: cuộn lên thì trượt lên (dừng khi co xong), kéo xuống thì trượt xuống theo.
  const heroTranslate = scrollY.interpolate({
    inputRange: [-400, 0, range],
    outputRange: [400, 0, -range],
    extrapolateRight: 'clamp',
  });
  const heroOpacity = scrollY.interpolate({
    inputRange: [0, range * 0.55],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const avatarScale = scrollY.interpolate({
    inputRange: [-PULL_MAX, 0, range],
    outputRange: [1.3, 1, 0.7],
    extrapolate: 'clamp',
  });
  const compactOpacity = scrollY.interpolate({
    inputRange: [range * 0.6, range],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const compactShift = scrollY.interpolate({
    inputRange: [range * 0.6, range],
    outputRange: [10, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {
          useNativeDriver: true,
        })}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: heroHeight + spacing.xl,
          paddingHorizontal: spacing.xl,
          // Nội dung ngắn nên kéo dài thêm để luôn cuộn được đủ quãng co hero.
          minHeight: windowHeight + range,
        }}>
        <Text style={styles.heading}>Thông tin liên hệ</Text>
        <View style={styles.card}>
          {PROFILE.contacts.map((c, i) => (
            <View
              key={c.label}
              style={[styles.contactRow, i > 0 && styles.contactDivider]}>
              <Text style={styles.contactLabel}>{c.label}</Text>
              <Text style={styles.contactValue}>{c.value}</Text>
            </View>
          ))}
        </View>
      </Animated.ScrollView>

      {/* Hero lớn: phủ lên nội dung, trượt cùng nội dung. Dải "fill" phía trên che vùng kéo giãn. */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.hero,
          {height: heroHeight, paddingTop: compactHeight},
          {transform: [{translateY: heroTranslate}]},
        ]}>
        <View style={styles.fill} />
        <Animated.View style={[styles.heroBody, {opacity: heroOpacity}]}>
          <Animated.View style={{transform: [{scale: avatarScale}]}}>
            <Avatar name={user.fullName} source={user.avatar} size={112} />
          </Animated.View>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.title}>{PROFILE.title}</Text>
          <View style={styles.badges}>
            <Text style={styles.badge}>Mã NV {user.employeeId}</Text>
            <Text style={styles.badge}>{user.storeCode}</Text>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Thanh nhỏ cố định: hiện dần (avatar nhỏ + tên) khi hero đã co lại. */}
      <View
        pointerEvents="none"
        style={[styles.compact, {height: compactHeight, paddingTop: insets.top}]}>
        <Animated.View
          style={[
            styles.compactInfo,
            {opacity: compactOpacity, transform: [{translateY: compactShift}]},
          ]}>
          <Text style={styles.compactName} numberOfLines={1}>
            {user.fullName}
          </Text>
          <Avatar name={user.fullName} source={user.avatar} size={34} />
        </Animated.View>
      </View>

      {/* Nút quay lại luôn nằm trên cùng, bấm được ở mọi trạng thái cuộn. */}
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Quay lại trang chủ"
        hitSlop={8}
        style={[styles.back, {top: insets.top}]}>
        <Text style={styles.backText}>‹ Trang chủ</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  hero: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    zIndex: 1,
  },
  // Kéo giãn lên phía trên màn hình để khi kéo xuống không lộ nền trắng.
  fill: {
    position: 'absolute',
    top: -1000,
    left: 0,
    right: 0,
    height: 1000,
    backgroundColor: colors.primary,
  },
  heroBody: {alignItems: 'center', paddingHorizontal: spacing.xl},
  name: {...typography.headline, color: colors.textOnPrimary, marginTop: spacing.md},
  title: {
    ...typography.body,
    color: colors.onPrimaryMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  badges: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md},
  badge: {
    ...typography.caption,
    color: colors.textOnPrimary,
    backgroundColor: colors.onPrimarySoft,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  compact: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 2,
    justifyContent: 'center',
  },
  compactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    height: BAR_HEIGHT,
    paddingLeft: 140, // chừa chỗ cho nút quay lại bên trái
    paddingRight: spacing.xl,
  },
  compactName: {...typography.body, fontWeight: '700', color: colors.textOnPrimary, flexShrink: 1},
  back: {
    position: 'absolute',
    left: spacing.xl,
    height: BAR_HEIGHT,
    justifyContent: 'center',
    zIndex: 3,
  },
  backText: {fontSize: 16, color: colors.textOnPrimary},
  heading: {...typography.title, color: colors.textPrimary, marginBottom: spacing.sm},
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    ...shadow,
  },
  contactRow: {paddingVertical: spacing.md},
  contactDivider: {borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.background},
  contactLabel: {...typography.caption, color: colors.textSecondary},
  contactValue: {...typography.body, color: colors.textPrimary, marginTop: 2},
});
