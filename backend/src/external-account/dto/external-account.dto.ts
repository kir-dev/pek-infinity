import { ApiProperty } from '@nestjs/swagger';
import { ExternalAccountProtocol } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ExternalAccountDto {
  @ApiProperty({ enum: ExternalAccountProtocol })
  @IsEnum(ExternalAccountProtocol)
  protocol: ExternalAccountProtocol;

  @IsString()
  @IsNotEmpty()
  accountName: string;
}

export class UpdateExternalAccountBatchDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExternalAccountDto)
  accounts: ExternalAccountDto[];
}
