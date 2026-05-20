import { Inject, Injectable } from '@nestjs/common';
import { demoDetails, demoMedia } from '../demo-data.js';
import { TmdbService } from '../tmdb/tmdb.service.js';
import type { MediaType } from '../tmdb/tmdb.types.js';

@Injectable()
export class MediaService {
  constructor(@Inject(TmdbService) private readonly tmdb: TmdbService) {}

  async trending() {
    return this.withFallback(() => this.tmdb.trending(), demoMedia);
  }

  async byType(mediaType: MediaType) {
    return this.withFallback(
      () => this.tmdb.list(mediaType, 'popular'),
      demoMedia.filter((item) => item.mediaType === mediaType),
    );
  }

  async list(
    mediaType: MediaType,
    list: 'popular' | 'top-rated' | 'now-playing' | 'upcoming' | 'airing-today',
  ) {
    return this.withFallback(
      () => this.tmdb.list(mediaType, list),
      demoMedia.filter((item) => item.mediaType === mediaType),
    );
  }

  async detail(mediaType: MediaType, tmdbId: number) {
    return this.withFallback(
      () => this.tmdb.detail(mediaType, tmdbId),
      demoDetails.find((item) => item.mediaType === mediaType && item.tmdbId === tmdbId) ?? null,
    );
  }

  async search(query: string) {
    const normalized = query.trim().toLowerCase();
    const fallback = normalized
      ? demoMedia.filter((item) =>
          [item.title, item.overview, item.mediaType, ...item.genres].some((value) =>
            value.toLowerCase().includes(normalized),
          ),
        )
      : demoMedia;
    return this.withFallback(() => this.tmdb.search(query), fallback);
  }

  private async withFallback<T>(load: () => Promise<T>, fallback: T) {
    try {
      return await load();
    } catch {
      return fallback;
    }
  }
}
