import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Avatar from '../../../shared/components/Avatar';
import IconButton from '../../../shared/components/IconButton';
import {colors, radius, spacing, typography} from '../../../shared/theme';
import {CurrentUser} from '../types';

type Props = {
  user: CurrentUser;
  onPressAvatar?: () => void;
  onPressStore?: () => void;
  onPressSettings?: () => void;
  onPressSearch?: () => void;
};

export default function HomeHeader({
  user,
  onPressAvatar,
  onPressStore,
  onPressSettings,
  onPressSearch,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {paddingTop: insets.top + spacing.md}]}>
      {/* Hai vòng tròn mờ trang trí phía sau, tạo chiều sâu cho nền */}
      <View style={[styles.glow, styles.glowLarge]} />
      <View style={[styles.glow, styles.glowSmall]} />

      <View style={styles.row}>
        <Pressable
          onPress={onPressAvatar}
          accessibilityRole="button"
          accessibilityLabel="Xem hồ sơ cá nhân"
          style={({pressed}) => pressed && styles.pressed}>
          <Avatar
            name={user.fullName}
            source={user.avatar}
            uri={user.avatarUri}
            size={52}
          />
        </Pressable>

        <View style={styles.info}>
          <Text style={styles.greeting}>Xin chào,</Text>
          <Text style={styles.name} numberOfLines={1}>
            {user.fullName}
          </Text>
          <Text style={styles.employeeId}>Mã NV {user.employeeId}</Text>
        </View>

        <View style={styles.actions}>
          <IconButton icon="⚙️" label="Cài đặt" onPress={onPressSettings} />
          <IconButton icon="🔍" label="Tìm kiếm" onPress={onPressSearch} />
        </View>
      </View>

      <Pressable
        onPress={onPressStore}
        accessibilityRole="button"
        accessibilityLabel={`Cửa hàng ${user.storeCode}`}
        style={({pressed}) => [styles.storeChip, pressed && styles.pressed]}>
        <View style={styles.storeDot} />
        <Text style={styles.storeText}>{user.storeCode}</Text>
        <Text style={styles.chevron}>⌄</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    opacity: 0.35,
  },
  glowLarge: {width: 220, height: 220, top: -90, right: -70},
  glowSmall: {width: 120, height: 120, bottom: -50, left: -30},
  row: {flexDirection: 'row', alignItems: 'center'},
  info: {flex: 1, marginHorizontal: spacing.md},
  greeting: {...typography.caption, color: colors.onPrimaryMuted},
  name: {...typography.title, color: colors.textOnPrimary},
  employeeId: {...typography.caption, color: colors.onPrimaryMuted},
  actions: {flexDirection: 'row', gap: spacing.sm},
  storeChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.onPrimarySoft,
    borderWidth: 1,
    borderColor: colors.onPrimaryBorder,
  },
  pressed: {opacity: 0.7},
  storeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginRight: spacing.sm,
  },
  storeText: {...typography.body, color: colors.textOnPrimary, fontWeight: '600'},
  chevron: {color: colors.textOnPrimary, marginLeft: spacing.sm, fontSize: 14},
});
