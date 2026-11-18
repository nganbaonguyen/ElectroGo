import React from 'react';
import {Pressable, ScrollView, StatusBar, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Avatar from '../../../shared/components/Avatar';
import {colors, radius, shadow, spacing, typography} from '../../../shared/theme';
import {PROFILE} from '../data/profile';
import {ProfileUser} from '../types';

type Props = {
  user: ProfileUser;
  onClose: () => void;
};

/** Hồ sơ cá nhân: mở khi bấm ảnh đại diện ở Home. */
export default function ProfileScreen({user, onClose}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{paddingBottom: insets.bottom + spacing.xxl}}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, {paddingTop: insets.top + spacing.md}]}>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            hitSlop={8}
            style={styles.back}>
            <Text style={styles.backText}>‹ Trang chủ</Text>
          </Pressable>
          <Avatar name={user.fullName} source={user.avatar} size={112} />
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.title}>{PROFILE.title}</Text>
          <View style={styles.badges}>
            <Text style={styles.badge}>Mã NV {user.employeeId}</Text>
            <Text style={styles.badge}>{user.storeCode}</Text>
          </View>
        </View>

        <Section heading="Giới thiệu">
          <Text style={styles.body}>{PROFILE.summary}</Text>
        </Section>

        <Section heading="Liên hệ">
          {PROFILE.contacts.map(c => (
            <View key={c.label} style={styles.contactRow}>
              <Text style={styles.contactLabel}>{c.label}</Text>
              <Text style={styles.contactValue}>{c.value}</Text>
            </View>
          ))}
        </Section>

        <Section heading="Kỹ năng">
          <View style={styles.chips}>
            {PROFILE.skills.map(s => (
              <Text key={s} style={styles.chip}>
                {s}
              </Text>
            ))}
          </View>
        </Section>

        <Section heading="Kinh nghiệm">
          {PROFILE.experiences.map(e => (
            <View key={`${e.company}-${e.period}`} style={styles.item}>
              <Text style={styles.itemTitle}>{e.role}</Text>
              <Text style={styles.itemSub}>
                {e.company} · {e.period}
              </Text>
              {e.highlights.map(h => (
                <Text key={h} style={styles.bullet}>
                  • {h}
                </Text>
              ))}
            </View>
          ))}
        </Section>

        <Section heading="Học vấn và chứng chỉ">
          {PROFILE.education.map(e => (
            <View key={e.title} style={styles.item}>
              <Text style={styles.itemTitle}>{e.title}</Text>
              <Text style={styles.itemSub}>
                {e.place} · {e.period}
              </Text>
            </View>
          ))}
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({heading, children}: {heading: string; children: React.ReactNode}) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{heading}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  hero: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  back: {alignSelf: 'flex-start', paddingVertical: spacing.sm, marginBottom: spacing.sm},
  backText: {fontSize: 16, color: colors.textOnPrimary},
  name: {...typography.headline, color: colors.textOnPrimary, marginTop: spacing.md},
  title: {
    ...typography.body,
    color: colors.onPrimaryMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  badges: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md},
  badge: {
    ...typography.caption,
    color: colors.textOnPrimary,
    backgroundColor: colors.onPrimarySoft,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  section: {paddingHorizontal: spacing.xl, marginTop: spacing.xl},
  heading: {...typography.title, color: colors.textPrimary, marginBottom: spacing.sm},
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    ...shadow,
  },
  body: {...typography.body, color: colors.textPrimary},
  contactRow: {paddingVertical: spacing.xs + 2},
  contactLabel: {...typography.caption, color: colors.textSecondary},
  contactValue: {...typography.body, color: colors.textPrimary},
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  chip: {
    ...typography.caption,
    color: colors.primary,
    backgroundColor: colors.iconTile,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  item: {marginBottom: spacing.md},
  itemTitle: {...typography.body, fontWeight: '700', color: colors.textPrimary},
  itemSub: {...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs},
  bullet: {...typography.body, color: colors.textPrimary, marginTop: spacing.xs},
});
