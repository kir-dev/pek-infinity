import {
  Controller,
  Get,
  // Redirect,
  Res,
  UseGuards,
  VERSION_NEUTRAL,
  Version,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import express from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorator/current-user.decorator';
import { JwtAuth } from './decorator/jwt.decorator';
import { JwtUserDto } from './dto/jwt-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  /**
   * Redirects to the authsch login page
   */
  @Get('login')
  @UseGuards(AuthGuard('authsch'))
  @Version(VERSION_NEUTRAL)
  login() {
    // never called
  }

  @Get('logout')
  logout(@Res() res: express.Response) {
    res.clearCookie('jwt');
    res.send();
  }

  /**
   * Endpoint for authsch to call after login
   *
   * Redirects to the frontend with the jwt token
   */
  @Get('callback')
  @UseGuards(AuthGuard('authsch'))
  // @Redirect()
  @Version(VERSION_NEUTRAL)
  oauthRedirect(
    @CurrentUser() user: Prisma.UserModel,
    @Res() res: express.Response
  ) {
    const { jwt } = this.authService.login(user);
    res.cookie('jwt', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    res.redirect(302, `${process.env.FRONTEND_AUTHORIZED_URL}?jwt=${jwt}`);
  }
  /**
   * Endpoint for jwt token validation
   */
  @Get('me')
  @JwtAuth()
  me(@CurrentUser() user: JwtUserDto): JwtUserDto {
    return user;
  }
}
