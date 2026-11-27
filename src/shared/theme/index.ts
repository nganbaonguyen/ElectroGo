import {Platform, ViewStyle} from 'react-native';

export const colors = {
  primary: '#0B3AA8', 
  primaryLight: '#1D5FE8',
  accent: '#FF9A1F', // cam của logo
  background: '#F4F6FB',
  surface: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textOnPrimary: '#FFFFFF',
  iconTile: '#E3EDFF', // nền xanh nhạt chung cho mọi ô icon
  // Lớp trong suốt dùng trên nền primary
  onPrimaryMuted: 'rgba(255,255,255,0.78)',
  onPrimarySoft: 'rgba(255,255,255,0.16)',
  onPrimaryBorder: 'rgba(255,255,255,0.28)',
};

export const spacing = {xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28};

/** Khoảng cách từ mép màn hình tới các khối nội dung (thẻ, banner) trên Home. */
export const GUTTER = 5;

export const radius = {md: 14, lg: 20, xl: 28, pill: 999};

export const typography = {
  caption: {fontSize: 12, lineHeight: 16},
  body: {fontSize: 14, lineHeight: 20},
  title: {fontSize: 18, lineHeight: 24, fontWeight: '700' as const},
  headline: {fontSize: 20, lineHeight: 26, fontWeight: '700' as const},
};

export const shadow: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#0B1F4D',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
  },
  default: {elevation: 3},
}) as ViewStyle;
