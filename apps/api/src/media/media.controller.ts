import { Controller, Get, Headers, Inject, NotFoundException, Param, ParseIntPipe, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service.js';
import { envelope } from '../common/http.js';
import type { Env } from '../config/env.js';
import { MediaService } from './media.service.js';

@Controller('media')
export class MediaController {
  constructor(
    @Inject(MediaService) private readonly media: MediaService,
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(ConfigService) private readonly config: ConfigService<Env, true>,
  ) {}

  @Get('trending')
  async trending() {
    return envelope(await this.media.trending());
  }

  @Get('movies')
  async movies() {
    return envelope(await this.media.byType('movie'));
  }

  @Get('movies/popular')
  async popularMovies() {
    return envelope(await this.media.list('movie', 'popular'));
  }

  @Get('movies/top-rated')
  async topRatedMovies() {
    return envelope(await this.media.list('movie', 'top-rated'));
  }

  @Get('movies/now-playing')
  async nowPlayingMovies() {
    return envelope(await this.media.list('movie', 'now-playing'));
  }

  @Get('movies/upcoming')
  async upcomingMovies() {
    return envelope(await this.media.list('movie', 'upcoming'));
  }

  @Get('series')
  async series() {
    return envelope(await this.media.byType('series'));
  }

  @Get('series/popular')
  async popularSeries() {
    return envelope(await this.media.list('series', 'popular'));
  }

  @Get('series/top-rated')
  async topRatedSeries() {
    return envelope(await this.media.list('series', 'top-rated'));
  }

  @Get('series/airing-today')
  async airingTodaySeries() {
    return envelope(await this.media.list('series', 'airing-today'));
  }

  @Get(':mediaType/:tmdbId')
  async detail(
    @Param('mediaType') mediaType: 'movie' | 'series',
    @Param('tmdbId', ParseIntPipe) tmdbId: number,
    @Headers('authorization') authorization: string | undefined,
    @Req() request: Request,
  ) {
    if (mediaType !== 'movie' && mediaType !== 'series') {
      throw new NotFoundException('Unsupported media type.');
    }
    const detail = await this.media.detail(mediaType, tmdbId, (await this.viewerId(authorization, request)) ?? undefined);
    if (!detail) throw new NotFoundException('Media not found.');
    return envelope(detail);
  }

  private viewerId(authorization: string | undefined, request: Request) {
    const cookies = request.cookies as Record<string, string | undefined> | undefined;
    return this.auth.resolveUserId({
      authorization,
      refreshToken: cookies?.[this.config.get('REFRESH_TOKEN_COOKIE_NAME', { infer: true })],
    });
  }
}
