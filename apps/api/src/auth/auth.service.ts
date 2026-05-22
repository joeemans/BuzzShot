import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuthProvider, Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'node:crypto';
import { URL, URLSearchParams } from 'node:url';
import { PrismaService } from '../database/prisma.service.js';
import type { Env } from '../config/env.js';

type AuthUser = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
};

type UserWithProfile = Prisma.UserGetPayload<{ include: { profile: true } }>;

type AccessTokenPayload = {
  sub?: string;
  username?: string;
};

type TokenContext = {
  userAgent?: string;
  ipAddress?: string;
};

type GoogleTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  id_token?: string;
};

type GoogleUserInfo = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  picture?: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly googleTokenEndpoint = 'https://oauth2.googleapis.com/token';
  private readonly googleUserInfoEndpoint = 'https://openidconnect.googleapis.com/v1/userinfo';

  constructor(
    @Inject(JwtService) private readonly jwt: JwtService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ConfigService) private readonly config: ConfigService<Env, true>,
  ) {}

  async register(
    input: { email: string; username: string; displayName: string; password: string },
    context: TokenContext,
  ) {
    const email = this.normalizeEmail(input.email);
    const username = this.normalizeUsername(input.username);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          username,
          passwordHash: await argon2.hash(input.password),
          profile: {
            create: {
              displayName: input.displayName.trim(),
            },
          },
        },
        include: { profile: true },
      });

      return this.sessionFor(user, context);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email or username is already in use.');
      }
      throw error;
    }
  }

  async login(input: { identifier: string; password: string }, context: TokenContext) {
    const identifier = input.identifier.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
      include: { profile: true },
    });

    if (!user?.passwordHash || !(await argon2.verify(user.passwordHash, input.password))) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.sessionFor(user, context);
  }

  async refresh(rawToken: string | undefined, context: TokenContext) {
    if (!rawToken) {
      throw new UnauthorizedException('Missing refresh token.');
    }

    const tokenHash = this.hashToken(rawToken);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { profile: true } } },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    if (storedToken.revokedAt) {
      await this.revokeAllForUser(storedToken.userId);
      throw new UnauthorizedException('Refresh token has already been used.');
    }

    if (storedToken.expiresAt <= new Date()) {
      throw new UnauthorizedException('Refresh token has expired.');
    }

    const nextRefreshToken = this.generateRefreshToken();
    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: {
          revokedAt: now,
          rotatedAt: now,
        },
      }),
      this.prisma.refreshToken.create({
        data: this.refreshTokenCreateData(storedToken.userId, nextRefreshToken, context),
      }),
    ]);

    return {
      user: this.safeUser(storedToken.user),
      accessToken: this.signAccessToken(storedToken.user),
      refreshToken: nextRefreshToken,
    };
  }

  async logout(rawToken: string | undefined) {
    if (!rawToken) return;

    await this.prisma.refreshToken.updateMany({
      where: {
        tokenHash: this.hashToken(rawToken),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  async logoutAll(input: { authorization: string | undefined; refreshToken: string | undefined }) {
    const userId = await this.resolveUserId(input);

    if (!userId) return;
    await this.revokeAllForUser(userId);
  }

  async currentUser(input: {
    authorization: string | undefined;
    refreshToken: string | undefined;
  }): Promise<AuthUser> {
    const userId = await this.resolveUserId(input);

    if (!userId) {
      throw new UnauthorizedException('Authentication required.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    return this.safeUser(user);
  }

  async resolveUserId(input: {
    authorization: string | undefined;
    refreshToken: string | undefined;
  }) {
    return (
      (await this.userIdFromAuthorization(input.authorization)) ??
      (await this.userIdFromRefreshToken(input.refreshToken))
    );
  }

  async requestPasswordReset(emailInput: string) {
    const email = this.normalizeEmail(emailInput);
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) return;

    const rawToken = this.generateRefreshToken();
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(rawToken),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    if (this.config.get('PASSWORD_RESET_TOKEN_LOGGING_ENABLED', { infer: true })) {
      this.logger.warn(`Development password reset token for ${user.email}: ${rawToken}`);
    }
  }

  async confirmPasswordReset(input: { token: string; password: string }) {
    const tokenHash = this.hashToken(input.token);
    const reset = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!reset || reset.usedAt || reset.expiresAt <= new Date()) {
      throw new BadRequestException('Password reset token is invalid or expired.');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: reset.userId },
        data: { passwordHash: await argon2.hash(input.password) },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: reset.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: reset.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  async changePassword(userId: string, input: { currentPassword: string; newPassword: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) {
      throw new ForbiddenException('Password changes are only available for password accounts.');
    }

    if (!(await argon2.verify(user.passwordHash, input.currentPassword))) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: await argon2.hash(input.newPassword) },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  createOAuthState() {
    return randomBytes(32).toString('base64url');
  }

  googleAuthorizationUrl(state: string) {
    const { clientId, callbackUrl } = this.googleConfig();
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');

    url.search = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
    }).toString();

    return url.toString();
  }

  async googleCallback(input: {
    code: string | undefined;
    state: string | undefined;
    expectedState: string | undefined;
    context: TokenContext;
  }) {
    if (
      !input.code ||
      !input.state ||
      !input.expectedState ||
      input.state !== input.expectedState
    ) {
      throw new UnauthorizedException('Invalid Google OAuth state.');
    }

    const googleUser = await this.fetchGoogleUser(input.code);
    if (!googleUser.sub || !googleUser.email) {
      throw new UnauthorizedException('Google did not return a usable profile.');
    }

    const user = await this.findOrCreateGoogleUser(googleUser);
    return this.sessionFor(user, input.context);
  }

  private async findOrCreateGoogleUser(googleUser: GoogleUserInfo): Promise<UserWithProfile> {
    const providerAccountId = googleUser.sub;
    const rawEmail = googleUser.email;

    if (!providerAccountId || !rawEmail) {
      throw new UnauthorizedException('Google did not return a usable profile.');
    }

    const email = this.normalizeEmail(rawEmail);

    const existingAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: OAuthProvider.GOOGLE,
          providerAccountId,
        },
      },
      include: { user: { include: { profile: true } } },
    });

    if (existingAccount) {
      return existingAccount.user;
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (existingUser) {
      const operations: Prisma.PrismaPromise<unknown>[] = [
        this.prisma.oAuthAccount.create({
          data: {
            userId: existingUser.id,
            provider: OAuthProvider.GOOGLE,
            providerAccountId,
          },
        }),
      ];
      const updateData: Prisma.UserUpdateInput = {};

      if (googleUser.email_verified && !existingUser.emailVerified) {
        updateData.emailVerified = new Date();
      }

      if (googleUser.picture && !existingUser.profile?.avatarUrl) {
        updateData.profile = { update: { avatarUrl: googleUser.picture } };
      }

      if (Object.keys(updateData).length > 0) {
        operations.push(
          this.prisma.user.update({
            where: { id: existingUser.id },
            data: updateData,
          }),
        );
      }

      await this.prisma.$transaction(operations);

      return this.prisma.user.findUniqueOrThrow({
        where: { id: existingUser.id },
        include: { profile: true },
      });
    }

    const username = await this.uniqueGoogleUsername(googleUser);
    const profileCreate: Prisma.ProfileCreateWithoutUserInput = {
      displayName: this.googleDisplayName(googleUser),
    };
    if (googleUser.picture) {
      profileCreate.avatarUrl = googleUser.picture;
    }

    return this.prisma.user.create({
      data: {
        email,
        username,
        ...(googleUser.email_verified ? { emailVerified: new Date() } : {}),
        oauthAccounts: {
          create: {
            provider: OAuthProvider.GOOGLE,
            providerAccountId,
          },
        },
        profile: {
          create: profileCreate,
        },
      },
      include: { profile: true },
    });
  }

  private async fetchGoogleUser(code: string): Promise<GoogleUserInfo> {
    const { clientId, clientSecret, callbackUrl } = this.googleConfig();
    const tokenResponse = await fetch(this.googleTokenEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new UnauthorizedException('Google token exchange failed.');
    }

    const tokenPayload = (await tokenResponse.json()) as GoogleTokenResponse;
    if (!tokenPayload.access_token) {
      throw new UnauthorizedException('Google token exchange failed.');
    }

    const userResponse = await fetch(this.googleUserInfoEndpoint, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${tokenPayload.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new UnauthorizedException('Google profile lookup failed.');
    }

    return (await userResponse.json()) as GoogleUserInfo;
  }

  private googleConfig() {
    const clientId = this.config.get('GOOGLE_CLIENT_ID', { infer: true });
    const clientSecret = this.config.get('GOOGLE_CLIENT_SECRET', { infer: true });
    const callbackUrl =
      this.config.get('GOOGLE_CALLBACK_URL', { infer: true }) ??
      `${this.config.get('API_URL', { infer: true })}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException('Google authentication is not configured.');
    }

    return { clientId, clientSecret, callbackUrl };
  }

  private async sessionFor(user: UserWithProfile, context: TokenContext) {
    const refreshToken = this.generateRefreshToken();
    await this.prisma.refreshToken.create({
      data: this.refreshTokenCreateData(user.id, refreshToken, context),
    });

    return {
      user: this.safeUser(user),
      accessToken: this.signAccessToken(user),
      refreshToken,
    };
  }

  private safeUser(user: UserWithProfile): AuthUser {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.profile?.displayName ?? user.username,
      avatarUrl: user.profile?.avatarUrl ?? null,
      bio: user.profile?.bio ?? null,
    };
  }

  private signAccessToken(user: Pick<UserWithProfile, 'id' | 'username'>) {
    return this.jwt.sign({ sub: user.id, username: user.username });
  }

  private refreshTokenCreateData(userId: string, rawToken: string, context: TokenContext) {
    return {
      userId,
      tokenHash: this.hashToken(rawToken),
      expiresAt: new Date(Date.now() + this.refreshTokenTtlMs()),
      ...(context.userAgent ? { userAgent: context.userAgent } : {}),
      ...(context.ipAddress ? { ipAddress: context.ipAddress } : {}),
    };
  }

  private refreshTokenTtlMs() {
    return this.config.get('REFRESH_TOKEN_TTL_DAYS', { infer: true }) * 24 * 60 * 60 * 1000;
  }

  private generateRefreshToken() {
    return randomBytes(48).toString('base64url');
  }

  private hashToken(rawToken: string) {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  private async revokeAllForUser(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  private async userIdFromAuthorization(authorization: string | undefined) {
    const token = this.extractBearerToken(authorization);
    if (!token) return null;

    try {
      const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token);
      return typeof payload.sub === 'string' && payload.sub.length > 0 ? payload.sub : null;
    } catch {
      return null;
    }
  }

  private async userIdFromRefreshToken(rawToken: string | undefined) {
    if (!rawToken) return null;

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hashToken(rawToken) },
      select: {
        userId: true,
        revokedAt: true,
        expiresAt: true,
      },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt <= new Date()) {
      return null;
    }

    return storedToken.userId;
  }

  private extractBearerToken(authorization: string | undefined) {
    if (!authorization?.startsWith('Bearer ')) return null;
    const token = authorization.slice('Bearer '.length).trim();
    return token.length > 0 ? token : null;
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private normalizeUsername(username: string) {
    return username.trim().toLowerCase();
  }

  private async uniqueGoogleUsername(googleUser: GoogleUserInfo) {
    const emailPrefix = googleUser.email?.split('@')[0] ?? 'user';
    const candidate = this.usernameCandidate(
      googleUser.given_name ?? googleUser.name ?? emailPrefix,
    );
    let username = candidate;
    let suffix = 1;

    while (await this.prisma.user.findUnique({ where: { username } })) {
      username = `${candidate}${suffix}`;
      suffix += 1;
    }

    return username;
  }

  private usernameCandidate(input: string) {
    const normalized = input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 20);

    if (normalized.length >= 3) return normalized;
    return `user_${randomBytes(3).toString('hex')}`;
  }

  private googleDisplayName(googleUser: GoogleUserInfo) {
    const displayName = googleUser.name?.trim();
    if (displayName) return displayName.slice(0, 80);
    return googleUser.email?.split('@')[0]?.slice(0, 80) ?? 'BuzzShot User';
  }
}
