import {ProfileInfo} from '../types';

/**
 * Thông tin hồ sơ (lấy từ CV). Khi có tính năng đăng nhập (features/auth),
 * thay file này bằng dữ liệu thật từ store/API.
 */
export const PROFILE: ProfileInfo = {
  title: 'Senior Mobile Developer | React Native',
  contacts: [
    {label: 'Điện thoại', value: '0896697761'},
    {label: 'Email', value: 'nganbaonguyen1515@gmail.com'},
    {label: 'Địa điểm', value: 'TP. Thủ Đức, TP. Hồ Chí Minh'},
    {label: 'LinkedIn', value: 'linkedin.com/in/nguyen-bao-ngan'},
  ],
};
