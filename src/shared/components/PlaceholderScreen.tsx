import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Ionicons} from '@react-native-vector-icons/ionicons/static';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, spacing, typography} from '../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  title: string;
  icon: IconName;
};

/** Màn hình tạm cho tính năng chưa làm. Thay bằng màn hình thật khi tạo feature tương ứng. */
export default function PlaceholderScreen({title, icon}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <Ionicons name={icon} size={48} color={colors.textSecondary} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hint}>Tính năng đang được phát triển</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: {
    ...typography.headline,
    marginTop: spacing.md,
    color: colors.textPrimary,
  },
  hint: {
    ...typography.body,
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
});
