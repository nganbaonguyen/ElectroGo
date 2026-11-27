import {Banner, NewsItem, SummaryData} from '../types';

/**
 * Nội dung mẫu cho Home. Khi có API, thay bằng dữ liệu thật (feature home gọi service,
 * Home không gõ cứng số liệu).
 */
export const SUMMARY: SummaryData = {
  title: 'Doanh số hôm nay',
  amount: 12999999,
  unit: 'VNĐ',
  note: 'Cập nhật lúc 15:30',
  delta: '+8,2% so với hôm qua',
  series: [
    {label: 'T6', value: 62},
    {label: 'T7', value: 48},
    {label: 'CN', value: 71},
    {label: 'T2', value: 55},
    {label: 'T3', value: 83},
    {label: 'T4', value: 66},
    {label: 'Nay', value: 100},
  ],
  stats: [
    {label: 'Đơn hàng', value: '18'},
    {label: 'Giờ công', value: '7,5 giờ'},
    {label: 'Phép còn', value: '8 ngày'},
  ],
};

export const BANNERS: Banner[] = [
  {
    key: 'b1',
    title: 'Thi đua doanh số tháng 11',
    subtitle: 'Top 10 cửa hàng nhận thưởng đến 5.000.000₫',
    action: 'Xem ngay',
    icon: 'trophy-outline',
    background: '#0B3AA8',
  },
  {
    key: 'b2',
    title: 'Đăng ký nghỉ phép cuối năm',
    subtitle: 'Gửi đơn trước ngày 30/11 để được duyệt sớm',
    action: 'Tạo đơn',
    icon: 'umbrella-outline',
    background: '#0F766E',
  },
  {
    key: 'b3',
    title: 'Khóa học bán hàng đa kênh',
    subtitle: 'Học trực tuyến, nhận chứng nhận nội bộ',
    action: 'Đăng ký',
    icon: 'school-outline',
    background: '#B45309',
  },
];

export const NEWS: NewsItem[] = [
  {key: 'n1', title: 'Cập nhật quy trình kiểm kho cuối tháng', time: 'Hôm nay, 09:12', icon: 'newspaper-outline'},
  {key: 'n2', title: 'Lịch trực cửa hàng tuần 48 đã được công bố', time: 'Hôm qua, 17:40', icon: 'calendar-outline'},
  {key: 'n3', title: 'Chương trình ưu đãi nhân viên mùa lễ hội', time: '23/11/2026', icon: 'gift-outline'},
];
