import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Ionicons} from '@react-native-vector-icons/ionicons/static';
import {colors, radius, spacing, typography} from '../../../shared/theme';
import {SummaryData} from '../types';

type Props = {data: SummaryData};

const CHART_HEIGHT = 52;
const NAVY = '#0B1F4D';

/** 12450000 -> "12.450.000" (tự định dạng, không phụ thuộc Intl của thiết bị). */
function formatNumber(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Thẻ tóm tắt đầu trang, nền xanh đậm như thẻ ngân hàng cao cấp: số lớn, mức tăng so với hôm qua,
 * biểu đồ cột 7 ngày (hôm nay màu cam) và ba chỉ số phụ. Bấm biểu tượng mắt để ẩn/hiện số.
 */
export default function SummaryCard({data}: Props) {
  const [visible, setVisible] = useState(true);
  const max = Math.max(...data.series.map(s => s.value));
  const lastIndex = data.series.length - 1;

  return (
    <View style={styles.card}>
      <View style={[styles.glow, styles.glowBig]} />
      <View style={[styles.glow, styles.glowSmall]} />

      <View style={styles.titleRow}>
        <Text style={styles.title}>{data.title}</Text>
        <Pressable
          onPress={() => setVisible(v => !v)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Ẩn số liệu' : 'Hiện số liệu'}>
          <Ionicons
            name={visible ? 'eye-outline' : 'eye-off-outline'}
            size={22}
            color={colors.onPrimaryMuted}
          />
        </Pressable>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.amount}>{visible ? formatNumber(data.amount) : '••••••••'}</Text>
        <Text style={styles.unit}>{data.unit}</Text>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.deltaPill}>
          <Ionicons name="trending-up-outline" size={14} color="#4ADE80" />
          <Text style={styles.deltaText}>{visible ? data.delta : '•••'}</Text>
        </View>
        <Text style={styles.note}>{data.note}</Text>
      </View>

      <View style={styles.chart}>
        {data.series.map((point, i) => (
          <View key={point.label} style={styles.barCol}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.bar,
                  {height: Math.max(6, (point.value / max) * CHART_HEIGHT)},
                  i === lastIndex && styles.barToday,
                ]}
              />
            </View>
            <Text style={[styles.barLabel, i === lastIndex && styles.barLabelToday]}>{point.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.statsRow}>
        {data.stats.map((stat, index) => (
          <View key={stat.label} style={[styles.stat, index > 0 && styles.statDivider]}>
            <Text style={styles.statValue}>{visible ? stat.value : '•••'}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: NAVY,
    borderRadius: radius.lg,
    padding: spacing.lg,
    overflow: 'hidden',
    shadowColor: NAVY,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 10},
    elevation: 8,
  },
  glow: {position: 'absolute', borderRadius: radius.pill, backgroundColor: colors.primaryLight, opacity: 0.22},
  glowBig: {width: 220, height: 220, top: -100, right: -60},
  glowSmall: {width: 120, height: 120, bottom: -50, left: -30, opacity: 0.16},
  titleRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  title: {...typography.body, color: colors.onPrimaryMuted, fontWeight: '600'},
  amountRow: {flexDirection: 'row', alignItems: 'flex-end', marginTop: spacing.xs},
  amount: {fontSize: 34, lineHeight: 42, fontWeight: '800', color: colors.textOnPrimary, letterSpacing: 0.3},
  unit: {...typography.body, color: colors.onPrimaryMuted, fontWeight: '700', marginLeft: spacing.sm, marginBottom: 7},
  metaRow: {flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs},
  deltaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(74,222,128,0.16)',
  },
  deltaText: {...typography.caption, color: '#4ADE80', fontWeight: '700', marginLeft: 4},
  note: {...typography.caption, color: colors.onPrimaryMuted, marginLeft: spacing.sm},
  chart: {flexDirection: 'row', marginTop: spacing.lg, gap: spacing.sm},
  barCol: {flex: 1, alignItems: 'center'},
  barTrack: {height: CHART_HEIGHT, width: '100%', justifyContent: 'flex-end', alignItems: 'center'},
  bar: {width: '62%', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.28)'},
  barToday: {backgroundColor: colors.accent},
  barLabel: {...typography.caption, color: colors.onPrimaryMuted, marginTop: 6, fontSize: 11},
  barLabelToday: {color: colors.textOnPrimary, fontWeight: '700'},
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.onPrimaryBorder,
  },
  stat: {flex: 1, alignItems: 'center'},
  statDivider: {borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: colors.onPrimaryBorder},
  statValue: {...typography.title, color: colors.textOnPrimary},
  statLabel: {...typography.caption, color: colors.onPrimaryMuted, marginTop: 2},
});
