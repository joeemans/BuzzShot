import { Controller, Get, Inject, NotFoundException, Param, ParseIntPipe } from '@nestjs/common';
import { envelope } from '../common/http.js';
import { MediaService } from './media.service.js';

@Controller('media')
export class MediaController {
  constructor(@Inject(MediaService) private readonly media: MediaService) {}

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
  async detail(@Param('mediaType') mediaType: 'movie' | 'series', @Param('tmdbId', ParseIntPipe) tmdbId: number) {
    if (mediaType !== 'movie' && mediaType !== 'series') {
      throw new NotFoundException('Unsupported media type.');
    }
    const detail = await this.media.detail(mediaType, tmdbId);
    if (!detail) throw new NotFoundException('Media not found.');
    return envelope(detail);
  }
}
