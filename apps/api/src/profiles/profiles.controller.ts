import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import type { Request } from 'express';
import { ApiAuthGuard } from '../auth/api-auth.guard.js';
import { AuthService } from '../auth/auth.service.js';
import { CurrentUser, type RequestUser } from '../auth/current-user.decorator.js';
import { ProfileUpdateDto } from '../common/dto.js';
import { envelope } from '../common/http.js';
import { toApiMediaType } from '../common/media.js';
import type { Env } from '../config/env.js';
import { PrismaService } from '../database/prisma.service.js';
import { demoProfiles } from '../demo-data.js';
import { MediaService } from '../media/media.service.js';

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
    watched: number;
    favorites: number;
    watchlist?: number;
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
        watched: true;
        favorites: true;
        watchlist: true;
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
    @Inject(MediaService) private readonly media: MediaService,
  ) {}

  @Get(':username/collections/:kind')
  async collection(
    @Param('username') usernameParam: string,
    @Param('kind') kind: 'watchlist' | 'watched' | 'favorites',
    @Headers('authorization') authorization: string | undefined,
    @Req() request: Request,
  ) {
    if (kind !== 'watchlist' && kind !== 'watched' && kind !== 'favorites') {
      throw new NotFoundException('Collection not found.');
    }
    const username = usernameParam.trim().toLowerCase();
    const viewerId = await this.viewerId(authorization, request);
    const user = await this.prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (!user) throw new NotFoundException('Profile not found.');
    if (kind === 'watchlist' && viewerId !== user.id) {
      throw new NotFoundException('Collection not found.');
    }

    const targets =
      kind === 'watchlist'
        ? await this.prisma.watchlistItem.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            select: { tmdbId: true, mediaType: true },
          })
        : kind === 'watched'
          ? await this.prisma.watchedItem.findMany({
              where: { userId: user.id },
              orderBy: { watchedAt: 'desc' },
              select: { tmdbId: true, mediaType: true },
            })
          : await this.prisma.favoriteItem.findMany({
              where: { userId: user.id },
              orderBy: { createdAt: 'desc' },
              select: { tmdbId: true, mediaType: true },
            });

    return envelope(
      await this.media.summaries(
        targets.map((item) => ({
          tmdbId: item.tmdbId,
          mediaType: toApiMediaType(item.mediaType),
        })),
      ),
    );
  }

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
            watched: true,
            favorites: true,
            watchlist: true,
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
              avatarUrl: this.nullableTrim(body.avatarUrl),
              favoriteGenres: body.favoriteGenres.slice(0, 8),
            },
            update: {
              displayName: body.displayName.trim(),
              bio: this.nullableTrim(body.bio),
              location: this.nullableTrim(body.location),
              avatarUrl: this.nullableTrim(body.avatarUrl),
              favoriteGenres: body.favoriteGenres.slice(0, 8),
            },
          },
        },
      },
      include: {
        profile: true,
        _count: { select: this.profileCountSelect() },
      },
    });
    return envelope(await this.profileFor(updated, user.id));
  }

  private async profileFor(
    user: UserProfileRecord,
    viewerId: string | null,
  ): Promise<ProfileResponse> {
    const canEdit = viewerId === user.id;
    const isFollowing =
      viewerId && viewerId !== user.id
        ? Boolean(
            await this.prisma.follow.findUnique({
              where: { followerId_followingId: { followerId: viewerId, followingId: user.id } },
              select: { id: true },
            }),
          )
        : false;
    const visibleListCount = canEdit
      ? user._count.lists
      : await this.prisma.customList.count({ where: { ownerId: user.id, isPrivate: false } });

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
        lists: visibleListCount,
        watched: user._count.watched,
        favorites: user._count.favorites,
        ...(canEdit ? { watchlist: user._count.watchlist } : {}),
      },
      viewer: {
        isFollowing,
        canEdit,
      },
    };
  }

  private profileCountSelect() {
    return {
      reviews: true,
      ratings: true,
      followers: true,
      following: true,
      lists: true,
      watched: true,
      favorites: true,
      watchlist: true,
    } satisfies Prisma.UserCountOutputTypeSelect;
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
