import { CurrentUser } from '@kir-dev/passport-authsch';
import { Controller, Get, Redirect, Res, UseGuards } from '@nestjs/common';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';

import { AuthSchGuard } from '@/auth/guards/authsch.guard';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { FRONTEND_CALLBACK } from '@/config/environment.config';
import { getHostFromUrl } from '@/utils/auth.utils';

import { AuthService } from './auth.service';
import { UserDto } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthSchGuard)
  @Get('login')
  @ApiResponse({
    status: 302,
    description: 'Redirects to the AuthSch login page.',
  })
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  login() {}

  @Get('callback')
  @UseGuards(AuthSchGuard)
  @Redirect(FRONTEND_CALLBACK, 302)
  @ApiResponse({
    status: 302,
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
  @ApiResponse({
    status: 302,
    description: 'Redirects to the frontend and clears the JWT cookie.',
  })
  logout(@Res() res: Response): void {
    res.clearCookie('jwt', {
      domain: getHostFromUrl(FRONTEND_CALLBACK),
    });
  }

  @Get('me')
  @UseGuards(JwtGuard)
  @ApiResponse({ type: UserDto })
  me(@CurrentUser() user: UserDto): UserDto {
    return user;
  }
}
