import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {colors, spacing, typography} from '../../../shared/theme';
import HomeHeader from '../components/HomeHeader';
import MiniAppGrid from '../components/MiniAppGrid';
import {MOCK_USER} from '../data/currentUser';
import {MINI_APPS} from '../data/miniApps';
import {MiniAppKey} from '../types';

type Props = {
  onOpenMiniApp: (key: MiniAppKey) => void;
};

export default function HomeScreen({onOpenMiniApp}: Props) {
  return (
    <View style={styles.container}>
      <HomeHeader user={MOCK_USER} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Tính năng</Text>
        <MiniAppGrid
          items={MINI_APPS}
          onPressItem={item => onOpenMiniApp(item.key)}
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
