import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Ionicons} from '@react-native-vector-icons/ionicons/static';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, radius, shadow, spacing, typography} from '../shared/theme';
import {TABS, TabItem, TabKey} from './tabs';

const BAR_HEIGHT = 62;
const SCAN_SIZE = 62;
const SCAN_OVERFLOW = 22; // phần nút quét nhô lên trên thanh

type Props = {
  active: TabKey;
  onChange: (key: TabKey) => void;
  onPressScan: () => void;
  /** Số thông báo chưa đọc theo từng tab; > 9 hiển thị "9+". */
  badges?: Partial<Record<TabKey, number>>;
};

export default function BottomTabBar({
  active,
  onChange,
  onPressScan,
  badges = {},
}: Props) {
  const insets = useSafeAreaInsets();
  const half = TABS.length / 2;
  const left = TABS.slice(0, half);
  const right = TABS.slice(half);

  const renderTab = (tab: TabItem) => (
    <TabButton
      key={tab.key}
      tab={tab}
      focused={tab.key === active}
      badge={badges[tab.key]}
      onPress={() => onChange(tab.key)}
    />
  );

  return (
    // Vùng ngoài cao hơn thanh để nút quét nhô lên vẫn nằm trong khung (Android chỉ nhận chạm trong khung cha)
    <View style={styles.wrapper}>
      <View style={[styles.bar, {paddingBottom: insets.bottom}]}>
        <View style={styles.row}>
          {left.map(renderTab)}
          <View style={styles.scanSlot} />
          {right.map(renderTab)}
        </View>
      </View>

      <Pressable
        onPress={onPressScan}
        accessibilityRole="button"
        accessibilityLabel="Quét mã"
        style={({pressed}) => [styles.scan, pressed && styles.scanPressed]}>
        <Ionicons name="scan-outline" size={30} color={colors.textOnPrimary} />
      </Pressable>
    </View>
  );
}

type TabButtonProps = {
  tab: TabItem;
  focused: boolean;
  badge?: number;
  onPress: () => void;
};

function TabButton({tab, focused, badge, onPress}: TabButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{selected: focused}}
      accessibilityLabel={tab.label}
      style={styles.tab}>
      <View>
        <Ionicons
          name={focused ? tab.iconActive : tab.icon}
          size={24}
          color={focused ? colors.primaryLight : colors.textSecondary}
        />
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.label, focused && styles.labelOn]} numberOfLines={1}>
        {tab.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {paddingTop: SCAN_OVERFLOW},
  bar: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  row: {flexDirection: 'row', height: BAR_HEIGHT},
  tab: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  scanSlot: {flex: 1},
  label: {
    ...typography.caption,
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
  labelOn: {color: colors.primaryLight, fontWeight: '700'},
  badge: {
    position: 'absolute',
    top: -6,
    right: -12,
    minWidth: 20,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {color: colors.textOnPrimary, fontSize: 10, fontWeight: '700'},
  scan: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    borderRadius: SCAN_SIZE / 2,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  scanPressed: {transform: [{scale: 0.94}]},
});
