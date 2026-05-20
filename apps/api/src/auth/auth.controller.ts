import { Body, Controller, Get, HttpCode, Inject, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { envelope } from '../common/http.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Post('register')
  async register(
    @Body() body: { email: string; username: string; displayName: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.auth.register(body);
    this.setRefreshCookie(response, session.refreshToken);
    return envelope({ user: session.user, accessToken: session.accessToken });
  }

  @HttpCode(200)
  @Post('login')
  async login(
    @Body() body: { identifier: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.auth.login(body);
    this.setRefreshCookie(response, session.refreshToken);
    return envelope({ user: session.user, accessToken: session.accessToken });
  }

  @HttpCode(200)
  @Post('refresh')
  refresh(@Res({ passthrough: true }) response: Response) {
    const session = this.auth.refresh();
    this.setRefreshCookie(response, session.refreshToken);
    return envelope({ accessToken: session.accessToken });
  }

  @HttpCode(204)
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(process.env.REFRESH_TOKEN_COOKIE_NAME ?? 'buzzshot_refresh');
  }

  @HttpCode(204)
  @Post('logout-all')
  logoutAll(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(process.env.REFRESH_TOKEN_COOKIE_NAME ?? 'buzzshot_refresh');
  }

  @Get('me')
  me() {
    return envelope(this.auth.currentUser());
  }

  @HttpCode(202)
  @Post('password-reset')
  passwordReset() {
    return envelope({ accepted: true });
  }

  @HttpCode(204)
  @Post('change-password')
  changePassword() {
    return;
  }

  private setRefreshCookie(response: Response, token: string) {
    response.cookie(process.env.REFRESH_TOKEN_COOKIE_NAME ?? 'buzzshot_refresh', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.COOKIE_SECURE === 'true',
      path: '/api/auth',
      maxAge: 1000 * 60 * 60 * 24 * Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 30),
    });
  }
}
