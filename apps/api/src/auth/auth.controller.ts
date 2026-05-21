import { Body, Controller, Get, Headers, HttpCode, Inject, Post, Query, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import { envelope } from '../common/http.js';
import type { Env } from '../config/env.js';
import { LoginDto, RegisterDto } from './auth.dto.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  private readonly googleStateCookieName = 'buzzshot_google_state';
  private readonly googleReturnCookieName = 'buzzshot_google_return';

  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(ConfigService) private readonly config: ConfigService<Env, true>,
  ) {}

  @Post('register')
  async register(
    @Body() body: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.auth.register(body, this.tokenContext(request));
    this.setRefreshCookie(response, session.refreshToken);
    return envelope({ user: session.user, accessToken: session.accessToken });
  }

  @HttpCode(200)
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.auth.login(body, this.tokenContext(request));
    this.setRefreshCookie(response, session.refreshToken);
    return envelope({ user: session.user, accessToken: session.accessToken });
  }

  @HttpCode(200)
  @Post('refresh')
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const session = await this.auth.refresh(this.refreshTokenFrom(request), this.tokenContext(request));
    this.setRefreshCookie(response, session.refreshToken);
    return envelope({ user: session.user, accessToken: session.accessToken });
  }

  @HttpCode(204)
  @Post('logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    await this.auth.logout(this.refreshTokenFrom(request));
    this.clearRefreshCookie(response);
  }

  @HttpCode(204)
  @Post('logout-all')
  async logoutAll(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.auth.logoutAll({ authorization, refreshToken: this.refreshTokenFrom(request) });
    this.clearRefreshCookie(response);
  }

  @Get('me')
  async me(@Headers('authorization') authorization: string | undefined, @Req() request: Request) {
    return envelope(await this.auth.currentUser({ authorization, refreshToken: this.refreshTokenFrom(request) }));
  }

  @Get('google')
  google(@Query('returnTo') returnTo: string | undefined, @Res() response: Response) {
    const state = this.auth.createOAuthState();
    response.cookie(this.googleStateCookieName, state, this.oauthCookieOptions());
    response.cookie(this.googleReturnCookieName, this.safeReturnTo(returnTo), this.oauthCookieOptions());
    response.redirect(this.auth.googleAuthorizationUrl(state));
  }

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const returnTo = this.safeReturnTo(this.cookieFrom(request, this.googleReturnCookieName));

    try {
      const session = await this.auth.googleCallback({
        code,
        state,
        expectedState: this.cookieFrom(request, this.googleStateCookieName),
        context: this.tokenContext(request),
      });
      this.setRefreshCookie(response, session.refreshToken);
      response.clearCookie(this.googleStateCookieName, this.oauthClearCookieOptions());
      response.clearCookie(this.googleReturnCookieName, this.oauthClearCookieOptions());
      response.redirect(`${this.config.get('WEB_URL', { infer: true })}${returnTo}`);
    } catch {
      response.clearCookie(this.googleStateCookieName, this.oauthClearCookieOptions());
      response.clearCookie(this.googleReturnCookieName, this.oauthClearCookieOptions());
      response.redirect(`${this.config.get('WEB_URL', { infer: true })}/login?error=google`);
    }
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
    response.cookie(this.refreshCookieName(), token, this.refreshCookieOptions());
  }

  private clearRefreshCookie(response: Response) {
    response.clearCookie(this.refreshCookieName(), this.refreshCookieOptions());
  }

  private refreshCookieName() {
    return this.config.get('REFRESH_TOKEN_COOKIE_NAME', { infer: true });
  }

  private refreshCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get('COOKIE_SECURE', { infer: true }),
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * this.config.get('REFRESH_TOKEN_TTL_DAYS', { infer: true }),
    };
  }

  private oauthCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get('COOKIE_SECURE', { infer: true }),
      path: '/api/auth',
      maxAge: 1000 * 60 * 10,
    };
  }

  private oauthClearCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get('COOKIE_SECURE', { infer: true }),
      path: '/api/auth',
    };
  }

  private refreshTokenFrom(request: Request) {
    return this.cookieFrom(request, this.refreshCookieName());
  }

  private cookieFrom(request: Request, name: string) {
    const cookies = request.cookies as Record<string, string | undefined> | undefined;
    return cookies?.[name];
  }

  private tokenContext(request: Request) {
    const context: { userAgent?: string; ipAddress?: string } = {};
    const userAgent = request.get('user-agent');
    if (userAgent) context.userAgent = userAgent;
    if (request.ip) context.ipAddress = request.ip;
    return context;
  }

  private safeReturnTo(value: string | undefined) {
    if (value?.startsWith('/') && !value.startsWith('//')) return value;
    return '/feed';
  }
}
