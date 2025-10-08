import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { SEMESTER_REGEX } from '../type/semester.type';

export class ChangeSemesterDto {
  @ApiProperty({
    example: '2022-2023/1',
    pattern: SEMESTER_REGEX.toString(),
  })
  @IsString()
  @IsNotEmpty()
  @Matches(SEMESTER_REGEX, {
    message: 'Semester name must be in the format of "2022-2023/1"',
  })
  name: string;
}
