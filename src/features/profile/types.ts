import type {ImageSourcePropType} from 'react-native';

/** Phần của CurrentUser (feature home) mà màn Hồ sơ cần; CurrentUser khớp kiểu này. */
export type ProfileUser = {
  employeeId: string;
  fullName: string;
  storeCode: string;
  avatar?: ImageSourcePropType;
};

export type ContactItem = {label: string; value: string};

export type ProfileInfo = {
  title: string;
  contacts: ContactItem[];
};
