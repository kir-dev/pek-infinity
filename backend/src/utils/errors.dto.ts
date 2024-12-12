import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';

import { NO_AUTH_TOKEN_ERROR } from './auth.utils';

@ApiExtraModels()
export class UnauthorizedErrorDto {
  @ApiProperty({ enum: ['Authorization token not found'] })
  message = NO_AUTH_TOKEN_ERROR;
  @ApiProperty({ enum: [401] })
  statusCode = 401;

  @ApiProperty({ enum: ['Unauthorized'], nullable: true })
  error? = 'Unauthorized';
}

@ApiExtraModels()
export class InternalServerErrorDto {
  @ApiProperty({ enum: [500] })
  statusCode = 500;
  @ApiProperty({ enum: ['Internal Server Error'] })
  message = 'Internal Server Error';
}

export class ForbiddenErrorDto {
  @ApiProperty({ enum: [403] })
  statusCode = 403;
  @ApiProperty()
  message: string;

  @ApiProperty({ example: 'pek:group:123:profile', nullable: true })
  resourceId?: string;
  @ApiProperty({ enum: ['CREATE', 'READ', 'UPDATE', 'DELETE'], nullable: true })
  resourceOp?: string;
  @ApiProperty({ enum: ['Forbidden'], nullable: true })
  error?: string;
}

@ApiExtraModels(ForbiddenErrorDto)
@ApiExtraModels(InternalServerErrorDto)
@ApiExtraModels(UnauthorizedErrorDto)
export class AxiosErrorResponseDto<T> {
  @ApiProperty({
    description: 'Data of type T',
    oneOf: [
      { $ref: getSchemaPath(InternalServerErrorDto) },
      { $ref: getSchemaPath(UnauthorizedErrorDto) },
      { $ref: getSchemaPath(ForbiddenErrorDto) },
    ],
  })
  data: T;
}

@ApiExtraModels()
export class AxiosErrorDto<T> {
  @ApiProperty({ type: () => AxiosErrorResponseDto })
  response: AxiosErrorResponseDto<T>;

  status: number;
}
