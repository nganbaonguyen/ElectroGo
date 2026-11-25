import type {ComponentProps} from 'react';
import type {ImageSourcePropType} from 'react-native';
import type {Ionicons} from '@react-native-vector-icons/ionicons/static';

/** Khóa định danh của mỗi mini app. Thêm mini app mới thì thêm khóa vào đây. */
export type MiniAppKey = 'work' | 'sale';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Một module hiển thị trên Home. Mỗi module thuộc về một mini app (`app`) và mở thẳng
 * một màn hình của mini app đó (`screen`, trùng tên route trong MiniNavigator của mini app).
 */
export type MiniAppItem = {
  key: string; // duy nhất trên Home, ví dụ 'work-payslip'
  app: MiniAppKey;
  screen: string;
  label: string;
  icon: IconName;
};

/** Ô chưa có mini app phía sau: bấm vào chỉ báo "sắp ra mắt". Khi làm xong thì đổi thành MiniAppItem. */
export type ComingSoonItem = {
  key: string;
  label: string;
  icon: IconName;
  app?: undefined;
};

/** Mọi ô có thể xuất hiện trên Home. */
export type HomeItem = MiniAppItem | ComingSoonItem;

export function isMiniApp(item: HomeItem): item is MiniAppItem {
  return item.app !== undefined;
}

/** Một nhóm menu có tiêu đề trên Home, ví dụ "Nhân sự". */
export type HomeSection = {
  key: string;
  title: string;
  accent: string; // màu biểu tượng và vạch tiêu đề của nhóm
  accentBg: string; // màu nền ô biểu tượng
  items: HomeItem[];
};

/** Một nút trong hàng thao tác nhanh, có màu riêng. */
export type QuickAction = {item: HomeItem; tint: string};

/** Thẻ tóm tắt đầu trang (dữ liệu mẫu, sau này lấy từ API). */
export type SummaryData = {
  title: string;
  amount: number;
  unit: string;
  note: string;
  delta: string; // ví dụ "+8,2% so với hôm qua"
  series: {label: string; value: number}[]; // 7 ngày gần nhất, ngày cuối là hôm nay
  stats: {label: string; value: string}[];
};

export type Banner = {
  key: string;
  title: string;
  subtitle: string;
  action: string; // chữ trên nút, ví dụ "Xem ngay"
  icon: IconName;
  background: string;
};

export type NewsItem = {
  key: string;
  title: string;
  time: string;
  icon: IconName;
};

export type CurrentUser = {
  employeeId: string;
  fullName: string;
  avatarUri?: string;
  avatar?: ImageSourcePropType; // ảnh local, ưu tiên hơn avatarUri
  storeCode: string;
};
