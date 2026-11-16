import {CurrentUser} from '../types';

/**
 * Dữ liệu mẫu. Khi có tính năng đăng nhập (features/auth), thay file này
 * bằng dữ liệu thật lấy từ store/API.
 */
export const MOCK_USER: CurrentUser = {
  employeeId: '165616',
  fullName: 'Nguyễn Bảo Ngân',
  storeCode: 'ST: 907',
};
