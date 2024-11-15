// update-personal.dto.ts
import { Dormitory, Gender } from '@prisma/client';

export class UpdatePersonalDto {
  description?: string;
  gender?: Gender;
  dateOfBirth?: Date;
  tel?: string;
  addr?: string;
  building?: Dormitory;
  room?: string;
}
