import { CurrentUser } from '@kir-dev/passport-authsch';
import { Get, Query, Redirect, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiFoundResponse, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { AccessService } from '@/access/access.service';
import { AuthSchGuard } from '@/auth/guards/authsch.guard';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { FRONTEND_CALLBACK } from '@/config/environment.config';
import { getHostFromUrl } from '@/utils/auth.utils';
import { ApiController } from '@/utils/controller.decorator';
import { AuthService } from './auth.service';
import { UserDto } from './entities/user.entity';
import { AuthorizationEntity } from '@/access/entities/authorization.entity';

@ApiController('auth', { authStrategy: 'NOT_ENFORCED' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    // private readonly accessService: AccessService
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
   * List of authorizations assigned to the authenticated user.
   * @param user - The user extracted from the authentication token.
   * @returns - An array of authorizations assigned to the user.
   */
  // @Get('authorization')
  // @UseGuards(JwtGuard)
  // async assignedAuthorizations(@CurrentUser() user: UserDto): Promise<AuthorizationEntity[]> {
  //   return this.accessService.findByAssignedToUser(user.id);
  // }

  // /**
  //  * List of statements assigned to the authenticated user through authorizations.
  //  * @param user - The user extracted from the authentication token.
  //  * @param requestedAuths - A list of authorization IDs the user has. Defaults to all.
  //  * @returns A list of statements assigned to the authorizations.
  //  */
  // @Get('authorization/statement')
  // @UseGuards(JwtGuard)
  // async assignedStatements(
  //   @CurrentUser() user: UserDto,
  //   @Query('roles') requestedAuths: string[] | null = null
  // ): Promise<Statement[]> {
  //   const myAuths = await this.accessService.findByAssignedToUser(user.id);
  //   const myAuthIds = myAuths.map((r) => r.id);

  //   const invalidRoles = requestedAuths?.filter((r) => !myAuthIds.includes(r)).join(', ') ?? '';
  //   if (invalidRoles) {
  //     throw new UnauthorizedException(
  //       `Tried to access roles the user does not have: ${invalidRoles}`
  //     );
  //   }

  //   return this.accessService.(requestedAuths ?? [user.id]);
  // }
}
