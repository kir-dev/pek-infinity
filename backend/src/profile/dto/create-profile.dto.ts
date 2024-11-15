// create-profile.dto.ts
import { Dormitory, Gender, StudentStatus } from '@prisma/client';

export class CreateProfileDto {
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
}
