import { Body, Controller, Get, Headers, Inject, NotFoundException, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import type { Request } from 'express';
import { ApiAuthGuard } from '../auth/api-auth.guard.js';
import { AuthService } from '../auth/auth.service.js';
import { CurrentUser, type RequestUser } from '../auth/current-user.decorator.js';
import { ProfileUpdateDto } from '../common/dto.js';
import { envelope } from '../common/http.js';
import type { Env } from '../config/env.js';
import { PrismaService } from '../database/prisma.service.js';
import { demoProfiles } from '../demo-data.js';

type ProfileResponse = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  favoriteGenres: string[];
  stats: {
    reviews: number;
    ratings: number;
    followers: number;
    following: number;
    lists: number;
  };
  viewer: {
    isFollowing: boolean;
    canEdit: boolean;
  };
};

type UserProfileRecord = Prisma.UserGetPayload<{
  include: {
    profile: true;
    _count: {
      select: {
        reviews: true;
        ratings: true;
        followers: true;
        following: true;
        lists: true;
      };
    };
  };
}>;

@Controller('profiles')
export class ProfilesController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(ConfigService) private readonly config: ConfigService<Env, true>,
  ) {}

  @Get(':username')
  async detail(
    @Param('username') usernameParam: string,
    @Headers('authorization') authorization: string | undefined,
    @Req() request: Request,
  ) {
    const username = usernameParam.trim().toLowerCase();
    const viewerId = await this.viewerId(authorization, request);
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        profile: true,
        _count: {
          select: {
            reviews: true,
            ratings: true,
            followers: true,
            following: true,
            lists: true,
          },
        },
      },
    });

    if (user) return envelope(await this.profileFor(user, viewerId));

    const profile = demoProfiles.find((item) => item.username === username);
    if (!profile) throw new NotFoundException('Profile not found.');
    return envelope(profile);
  }

  @UseGuards(ApiAuthGuard)
  @Patch('me')
  async updateMe(@CurrentUser() user: RequestUser, @Body() body: ProfileUpdateDto) {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        profile: {
          upsert: {
            create: {
              displayName: body.displayName.trim(),
              bio: this.nullableTrim(body.bio),
              location: this.nullableTrim(body.location),
              favoriteGenres: body.favoriteGenres.slice(0, 8),
            },
            update: {
              displayName: body.displayName.trim(),
              bio: this.nullableTrim(body.bio),
              location: this.nullableTrim(body.location),
              favoriteGenres: body.favoriteGenres.slice(0, 8),
            },
          },
        },
      },
      include: {
        profile: true,
        _count: {
          select: { reviews: true, ratings: true, followers: true, following: true, lists: true },
        },
      },
    });
    return envelope(await this.profileFor(updated, user.id));
  }

  private async profileFor(user: UserProfileRecord, viewerId: string | null): Promise<ProfileResponse> {
    const isFollowing =
      viewerId && viewerId !== user.id
        ? Boolean(
            await this.prisma.follow.findUnique({
              where: { followerId_followingId: { followerId: viewerId, followingId: user.id } },
              select: { id: true },
            }),
          )
        : false;

    return {
      id: user.id,
      username: user.username,
      displayName: user.profile?.displayName ?? user.username,
      avatarUrl: user.profile?.avatarUrl ?? null,
      bio: user.profile?.bio ?? null,
      location: user.profile?.location ?? null,
      favoriteGenres: user.profile?.favoriteGenres ?? [],
      stats: {
        reviews: user._count.reviews,
        ratings: user._count.ratings,
        followers: user._count.followers,
        following: user._count.following,
        lists: user._count.lists,
      },
      viewer: {
        isFollowing,
        canEdit: viewerId === user.id,
      },
    };
  }

  private viewerId(authorization: string | undefined, request: Request) {
    const cookies = request.cookies as Record<string, string | undefined> | undefined;
    return this.auth.resolveUserId({
      authorization,
      refreshToken: cookies?.[this.config.get('REFRESH_TOKEN_COOKIE_NAME', { infer: true })],
    });
  }

  private nullableTrim(value: string | null) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }
}
