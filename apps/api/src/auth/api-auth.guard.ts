import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { Env } from '../config/env.js';
import { AuthService } from './auth.service.js';
import type { RequestUser } from './current-user.decorator.js';

type RequestWithUser = Request & {
  user?: RequestUser;
};

@Injectable()
export class ApiAuthGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = await this.auth.currentUser({
      authorization: request.get('authorization'),
      refreshToken: this.refreshTokenFrom(request),
    });

    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    request.user = user;
    return true;
  }

  private refreshTokenFrom(request: Request) {
    const cookies = request.cookies as Record<string, string | undefined> | undefined;
    return cookies?.[this.config.get('REFRESH_TOKEN_COOKIE_NAME', { infer: true })];
  }
}
