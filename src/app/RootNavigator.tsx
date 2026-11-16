import React, {ComponentType, useCallback, useEffect, useState} from 'react';
import {
  Alert,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {HomeScreen, MiniAppItem} from '../features/home';
import {SplashScreen} from '../features/splash';
import MiniAppErrorBoundary from '../shared/components/MiniAppErrorBoundary';
import MiniAppErrorView from '../shared/components/MiniAppErrorView';
import MiniAppLoading from '../shared/components/MiniAppLoading';
import PlaceholderScreen from '../shared/components/PlaceholderScreen';
import {colors, spacing} from '../shared/theme';
import BottomTabBar from './BottomTabBar';
import {loadMiniApp, MiniAppProps} from './remotes';
import {TABS, TabKey} from './tabs';

// Dữ liệu mẫu; sau này lấy từ API/store (feature notifications).
const MOCK_BADGES: Partial<Record<TabKey, number>> = {notifications: 12};

/**
 * Điều hướng gốc của super app.
 * Hiện dùng state đơn giản; khi mini app cần nhiều màn hình thì thay bằng react-navigation.
 */
export default function RootNavigator() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabKey>('home');
  const [miniApp, setMiniApp] = useState<MiniAppItem | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const hideSplash = useCallback(() => setShowSplash(false), []);

  const onPressScan = () => Alert.alert('Quét mã', 'Tính năng đang được phát triển');

  // Mini app chiếm toàn màn hình, không hiện thanh tab.
  if (miniApp !== null) {
    return <MiniAppHost item={miniApp} onClose={() => setMiniApp(null)} topInset={insets.top} />;
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

/** Thời gian tối thiểu hiện màn loading khi tải/thử lại mini app. */
const MIN_LOADING_MS = 900;

type MiniAppHostProps = {item: MiniAppItem; onClose: () => void; topInset: number};

type LoadState =
  | {status: 'loading'}
  | {status: 'ready'; Component: ComponentType<MiniAppProps>}
  | {status: 'error'; message: string};

/**
 * Khung chứa mini app nạp động. Trạng thái tải do chính component này quản lý:
 * loading (logo) -> ready (hiện mini app) hoặc error (màn trắng có nút Thử lại / Đóng).
 * Không dùng lazy/Suspense để lỗi tải không bị ném trong lúc render (tránh màn đỏ ở chế độ dev).
 */
function MiniAppHost({item, onClose, topInset}: MiniAppHostProps) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<LoadState>({status: 'loading'});
  const name = item.label; // hiển thị tên module đang mở, ví dụ "Phiếu lương"

  useEffect(() => {
    let cancelled = false;
    setState({status: 'loading'});

    // Giữ màn loading (logo) tối thiểu MIN_LOADING_MS, kể cả khi kết quả (nhất là lỗi) về gần như tức thì,
    // để người dùng thấy rõ app đang thử lại thay vì thấy màn hình chớp.
    const minWait = new Promise<void>(resolve => setTimeout(resolve, MIN_LOADING_MS));
    const result = loadMiniApp(item.app).then(
      (Component): LoadState => ({status: 'ready', Component}),
      (e): LoadState => ({
        status: 'error',
        message: e instanceof Error ? e.message : 'Lỗi không xác định',
      }),
    );

    Promise.all([result, minWait]).then(([next]) => {
      if (!cancelled) {
        setState(next);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [item.app, attempt]);

  return (
    <View style={[styles.miniApp, {paddingTop: topInset}]}>
      <StatusBar barStyle="dark-content" />
      <Pressable style={styles.back} onPress={onClose}>
        <Text style={styles.backText}>‹ Trang chủ</Text>
      </Pressable>
      {state.status === 'loading' && <MiniAppLoading name={name} />}
      {state.status === 'error' && (
        <MiniAppErrorView
          name={name}
          message={state.message}
          onRetry={() => {
            setState({status: 'loading'}); // hiện loading ngay khi bấm, không chờ effect chạy
            setAttempt(a => a + 1);
          }}
          onClose={onClose}
        />
      )}
      {state.status === 'ready' && (
        <MiniAppErrorBoundary name={name} onClose={onClose}>
          <state.Component initialRoute={item.screen} />
        </MiniAppErrorBoundary>
      )}
    </View>
  );
}
