import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {colors, spacing, typography} from '../../../shared/theme';
import HomeHeader from '../components/HomeHeader';
import MiniAppGrid from '../components/MiniAppGrid';
import {MOCK_USER} from '../data/currentUser';
import {MINI_APPS} from '../data/miniApps';
import {MiniAppItem} from '../types';

type Props = {
  onOpenMiniApp: (item: MiniAppItem) => void;
  onPressAvatar?: () => void;
};

export default function HomeScreen({onOpenMiniApp, onPressAvatar}: Props) {
  return (
    <View style={styles.container}>
      <HomeHeader user={MOCK_USER} onPressAvatar={onPressAvatar} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Tính năng</Text>
        <MiniAppGrid
          items={MINI_APPS}
          onPressItem={onOpenMiniApp}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.xl},
  heading: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
});
