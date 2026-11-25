import React from 'react';
import {Alert, ScrollView, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FadeInView from '../../../shared/components/FadeInView';
import {colors, spacing} from '../../../shared/theme';
import HomeHeader, {HEADER_OVERLAP} from '../components/HomeHeader';
import MenuSection from '../components/MenuSection';
import NewsList from '../components/NewsList';
import PromoBanner from '../components/PromoBanner';
import QuickActions from '../components/QuickActions';
import SummaryCard from '../components/SummaryCard';
import {MOCK_USER} from '../data/currentUser';
import {BANNERS, NEWS, SUMMARY} from '../data/homeContent';
import {HOME_SECTIONS, QUICK_ACTIONS} from '../data/miniApps';
import {HomeItem, isMiniApp, MiniAppItem} from '../types';

type Props = {
  onOpenMiniApp: (item: MiniAppItem) => void;
  onPressAvatar?: () => void;
};

export default function HomeScreen({onOpenMiniApp, onPressAvatar}: Props) {
  const insets = useSafeAreaInsets();

  // Ô có mini app thì mở; ô chưa có thì báo "sắp ra mắt".
  const onPressItem = (item: HomeItem) => {
    if (isMiniApp(item)) {
      onOpenMiniApp(item);
    } else {
      Alert.alert(item.label, 'Tính năng sắp ra mắt');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Nền xanh phía trên: kéo xuống quá đầu trang vẫn thấy xanh, không lộ nền sáng */}
        <View style={styles.overscroll} />
        <HomeHeader user={MOCK_USER} onPressAvatar={onPressAvatar} />

        <FadeInView index={0} style={[styles.block, styles.floating]}>
          <SummaryCard data={SUMMARY} />
        </FadeInView>
        <FadeInView index={1} style={styles.block}>
          <QuickActions actions={QUICK_ACTIONS} onPressItem={onPressItem} />
        </FadeInView>
        <FadeInView index={2} style={styles.bannerBlock}>
          <PromoBanner banners={BANNERS} />
        </FadeInView>
        {HOME_SECTIONS.map((section, i) => (
          <FadeInView key={section.key} index={3 + i} style={styles.block}>
            <MenuSection section={section} onPressItem={onPressItem} />
          </FadeInView>
        ))}
        <FadeInView index={3 + HOME_SECTIONS.length} style={styles.block}>
          <NewsList items={NEWS} />
        </FadeInView>
      </ScrollView>

      {/* Dải xanh cố định sau thanh trạng thái: cuộn lên thì nội dung chui dưới dải này, chữ giờ pin vẫn đọc được */}
      <View pointerEvents="none" style={[styles.statusStrip, {height: insets.top}]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {paddingBottom: spacing.xxl},
  overscroll: {position: 'absolute', top: -1000, left: 0, right: 0, height: 1000, backgroundColor: colors.primary},
  statusStrip: {position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: colors.primary},
  block: {paddingHorizontal: spacing.xl, marginBottom: spacing.lg},
  floating: {marginTop: -HEADER_OVERLAP},
  bannerBlock: {marginBottom: spacing.lg},
});
