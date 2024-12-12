import { applyDecorators, Controller, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtGuard } from '@/auth/guards/jwt.guard';

import {
  AxiosErrorDto,
  ForbiddenErrorDto,
  InternalServerErrorDto,
  UnauthorizedErrorDto,
} from './errors.dto';

export interface ApiControllerOptions {
  /**
   * Strategy for authentication

   * ## options
   * - 'UNRESTRICTED' - no authentication required
   * - 'NOT_ENFORCED' - authentication reponse types are added, but authentication is not enforced
   * - 'ENFORCED' - authentication is enforced, request is rejected if not authenticated
   */
  authStrategy?: 'UNRESTRICTED' | 'NOT_ENFORCED' | 'ENFORCED';
}

export function ApiController(
  name: string,
  { authStrategy = 'ENFORCED' }: ApiControllerOptions = {},
): ClassDecorator {
  const decorators = [];
  decorators.push(
    Controller(name),
    ApiTags(name),
    ApiInternalServerErrorResponse({
      type: AxiosErrorDto<InternalServerErrorDto>,
      description: 'Internal Server Error',
      status: 500,
      example: {
        response: {
          data: {
            statusCode: 500,
            error: 'Internal Server Error',
            message: 'Human readable error',
          },
        },
        status: 500,
      },
    }),
  );
  if (authStrategy !== 'UNRESTRICTED') {
    decorators.push(
      ApiBearerAuth(),
      ApiCookieAuth('jwt'),
      ApiUnauthorizedResponse({
        type: AxiosErrorDto<UnauthorizedErrorDto>,
        description: 'Unauthorized',
        status: 401,
        example: {
          response: {
            data: {
              statusCode: 401,
              error: 'Unauthorized',
              message: 'Human readable error',
            },
          },
          status: 401,
        },
      }),
      ApiForbiddenResponse({
        type: AxiosErrorDto<ForbiddenErrorDto>,
        description: 'Forbidden',
        status: 403,
        example: {
          response: {
            data: {
              statusCode: 403,
              error: 'Forbidden',
              message: 'Human readable error',
            },
          },
          status: 403,
        },
      }),
    );
  }
  if (authStrategy === 'ENFORCED') {
    decorators.push(UseGuards(JwtGuard));
  }

  return applyDecorators(...decorators);
}
