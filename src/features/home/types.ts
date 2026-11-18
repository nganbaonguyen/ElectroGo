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

export type CurrentUser = {
  employeeId: string;
  fullName: string;
  avatarUri?: string;
  avatar?: ImageSourcePropType; // ảnh local, ưu tiên hơn avatarUri
  storeCode: string;
};
