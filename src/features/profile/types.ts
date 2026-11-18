import type {ImageSourcePropType} from 'react-native';

/** Phần của CurrentUser (feature home) mà màn Hồ sơ cần; CurrentUser khớp kiểu này. */
export type ProfileUser = {
  employeeId: string;
  fullName: string;
  storeCode: string;
  avatar?: ImageSourcePropType;
};

export type ContactItem = {label: string; value: string};

export type Experience = {
  role: string;
  company: string;
  period: string;
  highlights: string[];
};

export type Education = {
  title: string;
  place: string;
  period: string;
};

export type ProfileInfo = {
  title: string;
  summary: string;
  contacts: ContactItem[];
  skills: string[];
  experiences: Experience[];
  education: Education[];
};
