import React, {useCallback, useState} from 'react';
import {
  Alert,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import SaleApp from '@electrogo/sale';
import WorkApp from '@electrogo/work';
import {HomeScreen, MiniAppKey} from '../features/home';
import {SplashScreen} from '../features/splash';
import PlaceholderScreen from '../shared/components/PlaceholderScreen';
import {colors, spacing} from '../shared/theme';
import BottomTabBar from './BottomTabBar';
import {TABS, TabKey} from './tabs';

/** Bảng đăng ký: khóa mini app -> component gốc của mini app đó. */
const MINI_APP_COMPONENTS: Record<MiniAppKey, React.ComponentType> = {
  work: WorkApp,
  sale: SaleApp,
};

// Dữ liệu mẫu; sau này lấy từ API/store (feature notifications).
const MOCK_BADGES: Partial<Record<TabKey, number>> = {notifications: 12};

/**
 * Điều hướng gốc của super app.
 * Hiện dùng state đơn giản; khi mini app cần nhiều màn hình thì thay bằng react-navigation.
 */
export default function RootNavigator() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabKey>('home');
  const [miniApp, setMiniApp] = useState<MiniAppKey | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const hideSplash = useCallback(() => setShowSplash(false), []);

  const onPressScan = () => Alert.alert('Quét mã', 'Tính năng đang được phát triển');

  // Mini app chiếm toàn màn hình, không hiện thanh tab.
  if (miniApp !== null) {
    const MiniApp = MINI_APP_COMPONENTS[miniApp];
    return (
      <View style={[styles.miniApp, {paddingTop: insets.top}]}>
        <StatusBar barStyle="dark-content" />
        <Pressable style={styles.back} onPress={() => setMiniApp(null)}>
          <Text style={styles.backText}>‹ Trang chủ</Text>
        </Pressable>
        <MiniApp />
      </View>
    );
  }

  const current = TABS.find(t => t.key === tab)!;

  return (
    <View style={styles.root}>
      {/* Home có header xanh nên cần chữ trạng thái sáng; các tab khác nền sáng */}
      <StatusBar barStyle={tab === 'home' ? 'light-content' : 'dark-content'} />
      <View style={styles.content}>
        {tab === 'home' ? (
          <HomeScreen onOpenMiniApp={setMiniApp} />
        ) : (
          <PlaceholderScreen title={current.label} icon={current.iconActive} />
        )}
      </View>
      <BottomTabBar
        active={tab}
        onChange={setTab}
        onPressScan={onPressScan}
        badges={MOCK_BADGES}
      />
      {/* Splash phủ lên trên cùng, mờ dần rồi tự gỡ */}
      {showSplash && <SplashScreen onFinish={hideSplash} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  content: {flex: 1},
  miniApp: {flex: 1, backgroundColor: colors.surface},
  back: {paddingHorizontal: spacing.xl, paddingVertical: spacing.md},
  backText: {fontSize: 16, color: colors.primaryLight},
});
