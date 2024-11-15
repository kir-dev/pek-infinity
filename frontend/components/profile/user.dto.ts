export enum Dormitory {
  UNKNOWN = 'UNKNOWN',
  // Add other dormitory options as needed
}

export enum Gender {
  UNKNOWN = 'UNKNOWN',
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum StudentStatus {
  UNKNOWN = 'UNKNOWN',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  // Add other status options as needed
}

export interface Username {
  id: string;
  username: string;
  createdAt: Date;
}

export interface Membership {
  id: string;
  name: string;
  startDate: Date;
  endDate?: Date;
}

export interface Role {
  id: string;
  name: string;
}

export interface EntryAwardRequest {
  id: string;
  description: string;
  date: Date;
}

export interface Evaluation {
  id: string;
  points: number;
  evaluatedAt: Date;
}

export interface ExternalAccountLink {
  id: string;
  provider: string;
  accountId: string;
}

export interface SensitiveInfoPrivacy {
  id: string;
  infoType: string;
  isPrivate: boolean;
}

export interface Notification {
  id: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

export interface PointHistory {
  id: string;
  points: number;
  reason: string;
  createdAt: Date;
}

export interface UserDTO {
  // Unique Identifiers
  id: string;
  authSchId: string;
  usernames: Username[];

  // Personal Data
  firstName: string;
  lastName: string;
  nickname: string;
  isArchived: boolean;
  cellPhone: string;
  homeAddress: string;
  dateOfBirth: Date;
  room: string;
  dormitory: Dormitory;
  gender: Gender;
  studentStatus: StudentStatus;
  createdAt?: Date;
  lastLogin?: Date;

  // Relationships
  memberships: Membership[];
  roles: Role[];
  requestedEntryAwards: EntryAwardRequest[];
  evaluatedPointAwards: Evaluation[];
  evaluatedEntryAwards: EntryAwardRequest[];
  externalAccounts: ExternalAccountLink[];
  sensitiveInfoPrivacies: SensitiveInfoPrivacy[];
  receivedNotifications: Notification[];
  sentNotifications: Notification[];
  entries: EntryAwardRequest[];
  points: PointHistory[];
}
