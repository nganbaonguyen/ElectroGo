/** Khóa định danh của mỗi mini app. Thêm mini app mới thì thêm khóa vào đây. */
export type MiniAppKey = 'work' | 'sale';

export type MiniAppItem = {
  key: MiniAppKey;
  label: string;
  icon: string; // tạm dùng emoji, thay bằng icon thật sau
};

export type CurrentUser = {
  employeeId: string;
  fullName: string;
  avatarUri?: string;
  storeCode: string;
};
