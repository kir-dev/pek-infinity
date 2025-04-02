import { CurrentUser } from '@kir-dev/passport-authsch';
import {
  Get,
  Query,
  Redirect,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiFoundResponse, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';

import { AccessService } from '@/access/access.service';
import { RoleDto, Statement } from '@/access/dto/access.dto';
import { AuthSchGuard } from '@/auth/guards/authsch.guard';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { FRONTEND_CALLBACK } from '@/config/environment.config';
import { getHostFromUrl } from '@/utils/auth.utils';
import { ApiController } from '@/utils/controller.decorator';

import type { AuthService } from './auth.service';
import type { UserDto } from './entities/user.entity';

@ApiController('auth', { authStrategy: 'NOT_ENFORCED' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly accessService: AccessService,
  ) {}

  @UseGuards(AuthSchGuard)
  @Get('login')
  @ApiFoundResponse({
    description: 'Redirects to the AuthSch login page.',
  })
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  login() {}

  @Get('callback')
  @UseGuards(AuthSchGuard)
  @Redirect(FRONTEND_CALLBACK, 302)
  @ApiFoundResponse({
    description: 'Redirects to the frontend and sets cookie with JWT.',
  })
  @ApiQuery({ name: 'code', required: true })
  oauthRedirect(@CurrentUser() user: UserDto, @Res() res: Response): void {
    const jwt = this.authService.login(user);
    res.cookie('jwt', jwt, {
      httpOnly: true,
      secure: true,
      domain: getHostFromUrl(FRONTEND_CALLBACK),
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
  }

  @Get('logout')
  @Redirect(FRONTEND_CALLBACK, 302)
  @ApiFoundResponse({
    description: 'Redirects to the frontend and clears the JWT cookie.',
  })
  logout(@Res() res: Response): void {
    res.clearCookie('jwt', {
      domain: getHostFromUrl(FRONTEND_CALLBACK),
    });
  }

  @Get('me')
  @UseGuards(JwtGuard)
  me(@CurrentUser() user: UserDto): UserDto {
    return user;
  }

  /**
   * List of roles assigned to the authenticated user.
   * @param user - The user extracted from the authentication token.
   * @returns - An array of roles assigned to the user.
   */
  @Get('role')
  @UseGuards(JwtGuard)
  async assignedRoles(@CurrentUser() user: UserDto): Promise<RoleDto[]> {
    return this.accessService.userRoles(user.id);
  }

  /**
   * List of statements assigned to the authenticated user through roles.
   * @param user - The user extracted from the authentication token.
   * @param requestedRoles - A list of role IDs the user has. Defaults to all roles of the user.
   * @returns A list of statements assigned to the roles.
   */
  @Get('statement')
  @UseGuards(JwtGuard)
  async assignedStatements(
    @CurrentUser() user: UserDto,
    @Query('roles') requestedRoles: string[] | null = null,
  ): Promise<Statement[]> {
    const myRoles = await this.accessService.userRoles(user.id);
    const myRoleIds = myRoles.map((r) => r.id);

    const invalidRoles =
      requestedRoles?.filter((r) => !myRoleIds.includes(r)).join(', ') ?? '';
    if (invalidRoles) {
      throw new UnauthorizedException(
        `Tried to access roles the user does not have: ${invalidRoles}`,
      );
    }

    return this.accessService.getStatements(requestedRoles ?? [user.id]);
  }
}
