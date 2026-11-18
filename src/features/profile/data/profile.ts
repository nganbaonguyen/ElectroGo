import {ProfileInfo} from '../types';

/**
 * Thông tin hồ sơ (lấy từ CV). Khi có tính năng đăng nhập (features/auth),
 * thay file này bằng dữ liệu thật từ store/API.
 */
export const PROFILE: ProfileInfo = {
  title: 'Senior Mobile Developer | React Native',
  summary:
    'Hơn 5 năm làm ứng dụng cho bán lẻ và vận hành nội bộ. Mạnh về React Native, tích hợp đối tác, kiến trúc module và quản lý phát hành cho các luồng nghiệp vụ quan trọng.',
  contacts: [
    {label: 'Điện thoại', value: '0896697761'},
    {label: 'Email', value: 'nganbaonguyen1515@gmail.com'},
    {label: 'Địa điểm', value: 'TP. Thủ Đức, TP. Hồ Chí Minh'},
    {label: 'LinkedIn', value: 'linkedin.com/in/nguyen-bao-ngan'},
  ],
  skills: [
    'React Native',
    'TypeScript',
    'JavaScript',
    'Kiến trúc module',
    'Thanh toán, ví điện tử, trả góp',
    'CI/CD, CodePush',
    'App Store Connect, Google Play Console',
    'OCR và thiết bị ngoại vi',
    'Analytics',
  ],
  experiences: [
    {
      role: 'Mobile Developer',
      company: 'Mobile World Information Technology Center',
      period: '09/2021 - nay',
      highlights: [
        'Phát triển ứng dụng hỗ trợ bán lẻ và bán hàng tại Mobile World, phục vụ hơn 1000 cửa hàng toàn quốc.',
        'Tích hợp trả góp (FE Credit, Home Credit, ACS) và ví điện tử (MoMo, VNPay, SmartPay, ZaloPay).',
        'Thiết kế nền tảng mini app theo hướng micro-frontend.',
        'Tham gia CI/CD, đưa app lên App Store, Google Play và phát hành bằng CodePush.',
        'Đang làm công cụ bán bảo hiểm với đối tác MIC, LG, PVI, Samsung.',
      ],
    },
    {
      role: 'Mobile Developer',
      company: 'Cozwork Joint Stock Company',
      period: 'Trước 09/2021',
      highlights: [
        'Phát triển ứng dụng cổng nội bộ cho chấm công và quản lý nhân sự.',
        'Làm quen toàn bộ vòng đời tính năng di động: phát triển, sửa lỗi, bảo trì.',
      ],
    },
  ],
  education: [
    {
      title: 'Cử nhân Công nghệ thông tin / Kỹ thuật phần mềm',
      place: 'Đại học Công Thương TP.HCM',
      period: '2016 - 2020',
    },
    {
      title: 'Chứng chỉ Lập trình di động',
      place: 'Đại học Khoa học Tự nhiên, ĐHQG-HCM',
      period: '2020',
    },
  ],
};
