import React, {ComponentType, useCallback, useEffect, useState} from 'react';
import {Alert, StatusBar, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {HomeScreen, MINI_APP_NAMES, MiniAppItem, MOCK_USER} from '../features/home';
import {ProfileScreen} from '../features/profile';
import {SplashScreen} from '../features/splash';
import MiniAppErrorBoundary from '../shared/components/MiniAppErrorBoundary';
import MiniAppErrorView from '../shared/components/MiniAppErrorView';
import MiniAppHeader from '../shared/components/MiniAppHeader';
import MiniAppLoading from '../shared/components/MiniAppLoading';
import PlaceholderScreen from '../shared/components/PlaceholderScreen';
import {reportMiniAppError} from '../shared/monitoring/crashlytics';
import {colors} from '../shared/theme';
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
  const [showProfile, setShowProfile] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const hideSplash = useCallback(() => setShowSplash(false), []);

  const onPressScan = () => Alert.alert('Quét mã', 'Tính năng đang được phát triển');

  // Mini app chiếm toàn màn hình, không hiện thanh tab.
  if (miniApp !== null) {
    return (
      <MiniAppHost
        item={miniApp}
        onClose={() => setMiniApp(null)}
        topInset={insets.top}
        bottomInset={insets.bottom}
      />
    );
  }

  // Hồ sơ cá nhân chiếm toàn màn hình, mở khi bấm ảnh đại diện ở Home.
  if (showProfile) {
    return <ProfileScreen user={MOCK_USER} onClose={() => setShowProfile(false)} />;
  }

  const current = TABS.find(t => t.key === tab)!;

  return (
    <View style={styles.root}>
      {/* Home có header xanh nên cần chữ trạng thái sáng; các tab khác nền sáng */}
      <StatusBar barStyle={tab === 'home' ? 'light-content' : 'dark-content'} />
      <View style={styles.content}>
        {tab === 'home' ? (
          <HomeScreen
            onOpenMiniApp={setMiniApp}
            onPressAvatar={() => setShowProfile(true)}
          />
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
  miniAppBody: {flex: 1},
});

/** Thời gian tối thiểu hiện màn loading khi tải/thử lại mini app (chưa tính ~0,7 giây hiệu ứng kết thúc). */
const MIN_LOADING_MS = 1200;

type MiniAppHostProps = {item: MiniAppItem; onClose: () => void; topInset: number; bottomInset: number};

type LoadState =
  | {status: 'loading'}
  | {status: 'ready'; Component: ComponentType<MiniAppProps>}
  | {status: 'error'; message: string};

/**
 * Khung chứa mini app nạp động. Trạng thái tải do chính component này quản lý:
 * loading -> ready (hiện mini app) hoặc error (màn trắng có nút Thử lại / Đóng).
 * Màn loading phủ lên trên cùng; khi có kết quả nó chạy hiệu ứng kết thúc rồi mờ dần để lộ nội dung phía dưới.
 * Không dùng lazy/Suspense để lỗi tải không bị ném trong lúc render (tránh màn đỏ ở chế độ dev).
 */
function MiniAppHost({item, onClose, topInset, bottomInset}: MiniAppHostProps) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<LoadState>({status: 'loading'});
  const [overlay, setOverlay] = useState(true); // màn loading còn hiện (kể cả lúc đang mờ dần)
  const hideOverlay = useCallback(() => setOverlay(false), []);
  const name = item.label; // hiển thị tên module đang mở, ví dụ "Phiếu lương"

  useEffect(() => {
    let cancelled = false;
    setState({status: 'loading'});
    setOverlay(true);

    // Giữ màn loading tối thiểu MIN_LOADING_MS, kể cả khi kết quả (nhất là lỗi) về gần như tức thì,
    // để người dùng thấy rõ app đang thử lại thay vì thấy màn hình chớp.
    const minWait = new Promise<void>(resolve => setTimeout(resolve, MIN_LOADING_MS));
    const result = loadMiniApp(item.app).then(
      (Component): LoadState => ({status: 'ready', Component}),
      (e): LoadState => {
        reportMiniAppError(e, item.app);
        return {status: 'error', message: e instanceof Error ? e.message : 'Lỗi không xác định'};
      },
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

  // Lớp ngoài không padding để màn loading (absolute) phủ kín cả vùng tai thỏ và thanh điều hướng.
  // paddingBottom: chừa chỗ cho thanh điều hướng Android ở đáy, không có thì phần sát đáy của mini app bị nó che mất
  return (
    <View style={styles.miniApp}>
      <StatusBar barStyle={overlay ? 'light-content' : 'dark-content'} />
      <View style={[styles.miniAppBody, {paddingTop: topInset, paddingBottom: bottomInset}]}>
        <MiniAppHeader title={MINI_APP_NAMES[item.app]} onBack={onClose} />
        {state.status === 'error' && (
          <MiniAppErrorView
            name={name}
            message={state.message}
            onRetry={() => {
              setState({status: 'loading'}); // hiện loading ngay khi bấm, không chờ effect chạy
              setOverlay(true);
              setAttempt(a => a + 1);
            }}
            onClose={onClose}
          />
        )}
        {state.status === 'ready' && (
          <MiniAppErrorBoundary name={name} app={item.app} onClose={onClose}>
            <state.Component initialRoute={item.screen} />
          </MiniAppErrorBoundary>
        )}
      </View>
      {overlay && (
        <MiniAppLoading
          key={attempt} // thử lại thì chạy lại hiệu ứng từ đầu
          name={name}
          icon={item.icon}
          done={state.status !== 'loading'}
          onHidden={hideOverlay}
          onClose={onClose}
          topInset={topInset}
          bottomInset={bottomInset}
        />
      )}
    </View>
  );
}
