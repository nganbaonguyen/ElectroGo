import type {ComponentProps} from 'react';
import type {Ionicons} from '@react-native-vector-icons/ionicons/static';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/** Khóa các tab ở thanh dưới. Nút quét ở giữa không phải tab nên không nằm ở đây. */
export type TabKey = 'home' | 'identity' | 'notifications' | 'tickets';

export type TabItem = {
  key: TabKey;
  label: string;
  icon: IconName; // icon khi chưa chọn (dạng viền)
  iconActive: IconName; // icon khi đang chọn (dạng đặc)
};

/**
 * Thứ tự hiển thị: 2 tab bên trái, nút quét ở giữa, 2 tab bên phải.
 * BottomTabBar tự chèn nút quét vào giữa dựa trên mảng này.
 */
export const TABS: TabItem[] = [
  {key: 'home', label: 'Trang chủ', icon: 'home-outline', iconActive: 'home'},
  {key: 'identity', label: 'Định danh', icon: 'id-card-outline', iconActive: 'id-card'},
  {key: 'notifications', label: 'Thông báo', icon: 'notifications-outline', iconActive: 'notifications'},
  {key: 'tickets', label: 'Tạo phiếu', icon: 'document-text-outline', iconActive: 'document-text'},
];
