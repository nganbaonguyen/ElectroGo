import {MiniAppItem} from '../types';

/**
 * Các module hiển thị trên Home, theo đúng thứ tự. Mỗi dòng = một icon.
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
