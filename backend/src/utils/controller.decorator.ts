import { applyDecorators, Controller } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import {
  AxiosErrorDto,
  ForbiddenErrorDto,
  InternalServerErrorDto,
  UnauthorizedErrorDto,
} from './errors.dto';

export function ApiController(
  name: string,
  { withAuth = true } = {},
): ClassDecorator {
  return applyDecorators(
    Controller(name),
    ApiTags(name),
    ApiInternalServerErrorResponse({
      type: AxiosErrorDto<InternalServerErrorDto>,
      description: 'Internal Server Error',
    }),
    ...(withAuth
      ? [
          ApiUnauthorizedResponse({
            type: AxiosErrorDto<UnauthorizedErrorDto>,
            description: 'Unauthorized',
          }),
          ApiForbiddenResponse({
            type: AxiosErrorDto<ForbiddenErrorDto>,
            description: 'Forbidden',
          }),
          ApiBearerAuth(),
          ApiCookieAuth('jwt'),
        ]
      : []),
  );
}
