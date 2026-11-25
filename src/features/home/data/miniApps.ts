import {ComingSoonItem, HomeItem, HomeSection, MiniAppItem, QuickAction} from '../types';

/**
 * Các ô có mini app phía sau. Mỗi dòng = một ô trên Home.
 * `app` là mini app chứa module, `screen` là màn hình mở thẳng (khớp route trong mini app).
 */
export const MINI_APPS: MiniAppItem[] = [
  // Mini app Chấm công
  {key: 'work-attendance', app: 'work', screen: 'attendance', label: 'Chấm công', icon: 'finger-print-outline'},
  {key: 'work-schedule', app: 'work', screen: 'schedule', label: 'Lịch làm việc', icon: 'calendar-outline'},
  {key: 'work-leave', app: 'work', screen: 'leave', label: 'Nghỉ phép', icon: 'umbrella-outline'},
  {key: 'work-payslip', app: 'work', screen: 'payslip', label: 'Phiếu lương', icon: 'cash-outline'},
  // Mini app Bán hàng
  {key: 'sale-orders', app: 'sale', screen: 'orders', label: 'Đơn hàng', icon: 'receipt-outline'},
  {key: 'sale-products', app: 'sale', screen: 'products', label: 'Sản phẩm', icon: 'cube-outline'},
  {key: 'sale-customers', app: 'sale', screen: 'customers', label: 'Khách hàng', icon: 'people-outline'},
  {key: 'sale-report', app: 'sale', screen: 'report', label: 'Báo cáo', icon: 'bar-chart-outline'},
];

/** Các ô chưa có mini app: Home vẫn hiện để người dùng thấy lộ trình tính năng. */
const COMING_SOON: ComingSoonItem[] = [
  {key: 'scan', label: 'Quét mã', icon: 'qr-code-outline'},
  {key: 'work-overtime', label: 'Tăng ca', icon: 'timer-outline'},
  {key: 'work-timesheet', label: 'Bảng công', icon: 'clipboard-outline'},
  {key: 'work-training', label: 'Đào tạo', icon: 'school-outline'},
  {key: 'work-documents', label: 'Văn bản', icon: 'folder-open-outline'},
  {key: 'sale-promotion', label: 'Khuyến mãi', icon: 'pricetag-outline'},
  {key: 'sale-stock', label: 'Tồn kho', icon: 'storefront-outline'},
  {key: 'sale-debt', label: 'Công nợ', icon: 'card-outline'},
  {key: 'sale-contract', label: 'Hợp đồng', icon: 'document-text-outline'},
  {key: 'util-support', label: 'Hỗ trợ', icon: 'headset-outline'},
  {key: 'util-news', label: 'Tin nội bộ', icon: 'newspaper-outline'},
  {key: 'util-feedback', label: 'Góp ý', icon: 'chatbubbles-outline'},
  {key: 'util-guide', label: 'Hướng dẫn', icon: 'help-circle-outline'},
];

const ALL: HomeItem[] = [...MINI_APPS, ...COMING_SOON];
const byKey = (keys: string[]): HomeItem[] =>
  keys.map(k => {
    const item = ALL.find(i => i.key === k);
    if (!item) {
      throw new Error(`Home: không có ô "${k}"`);
    }
    return item;
  });

/** Hàng thao tác nhanh ngay dưới thẻ tóm tắt (tối đa 4 ô). */
export const QUICK_ACTIONS: QuickAction[] = [
  {item: byKey(['work-attendance'])[0], tint: '#1D5FE8'},
  {item: byKey(['sale-orders'])[0], tint: '#0F766E'},
  {item: byKey(['scan'])[0], tint: '#111827'},
  {item: byKey(['work-payslip'])[0], tint: '#B45309'},
];

/** Các nhóm menu, theo đúng thứ tự hiển thị. */
export const HOME_SECTIONS: HomeSection[] = [
  {
    key: 'hr',
    title: 'Nhân sự',
    accent: '#1D5FE8',
    accentBg: '#E3EDFF',
    items: byKey(['work-attendance', 'work-schedule', 'work-leave', 'work-payslip', 'work-overtime', 'work-timesheet', 'work-training', 'work-documents']),
  },
  {
    key: 'sale',
    title: 'Bán hàng',
    accent: '#0F766E',
    accentBg: '#DDF4F0',
    items: byKey(['sale-orders', 'sale-products', 'sale-customers', 'sale-report', 'sale-promotion', 'sale-stock', 'sale-debt', 'sale-contract']),
  },
  {
    key: 'util',
    title: 'Tiện ích',
    accent: '#B45309',
    accentBg: '#FDEBD3',
    items: byKey(['util-support', 'util-news', 'util-feedback', 'util-guide']),
  },
];
