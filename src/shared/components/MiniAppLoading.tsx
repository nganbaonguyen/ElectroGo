import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {colors, spacing, typography} from '../theme';

type Props = {name: string};

/** Màn hình chờ khi đang tải mini app: vòng xoay loading thông thường trên nền trắng. */
export default function MiniAppLoading({name}: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primaryLight} />
      <Text style={styles.text}>Đang tải {name}...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  text: {
    ...typography.body,
    marginTop: spacing.lg,
    color: colors.textSecondary,
  },
});
