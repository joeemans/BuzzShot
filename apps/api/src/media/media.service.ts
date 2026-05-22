import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { demoDetails, demoMedia, demoPeople } from '../demo-data.js';
import { TmdbService } from '../tmdb/tmdb.service.js';
import type { MediaDetail, MediaSummary, MediaType } from '../tmdb/tmdb.types.js';
import { toPrismaMediaType } from '../common/media.js';

@Injectable()
export class MediaService {
  constructor(
    @Inject(TmdbService) private readonly tmdb: TmdbService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

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

  async detail(mediaType: MediaType, tmdbId: number, userId?: string) {
    const detail = await this.withFallback(
      () => this.tmdb.detail(mediaType, tmdbId),
      demoDetails.find((item) => item.mediaType === mediaType && item.tmdbId === tmdbId) ?? null,
    );
    if (!detail) return null;
    return {
      ...detail,
      buzz: await this.buzzFor(mediaType, tmdbId),
      viewer: userId
        ? await this.viewerStateFor(userId, mediaType, tmdbId)
        : this.emptyViewerState(),
    };
  }

  async person(personId: number) {
    return this.withFallback(
      () => this.tmdb.person(personId),
      demoPeople.find((person) => person.id === personId) ?? null,
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

  async summary(mediaType: MediaType, tmdbId: number): Promise<MediaSummary> {
    const detail = await this.detail(mediaType, tmdbId);
    if (detail) return this.toSummary(detail);
    return this.fallbackSummary(mediaType, tmdbId);
  }

  async summaries(targets: Array<{ mediaType: MediaType; tmdbId: number }>) {
    return Promise.all(targets.map((target) => this.summary(target.mediaType, target.tmdbId)));
  }

  async buzzFor(mediaType: MediaType, tmdbId: number) {
    const prismaMediaType = toPrismaMediaType(mediaType);
    const [ratingAggregate, reviewsCount] = await Promise.all([
      this.prisma.rating.aggregate({
        where: { tmdbId, mediaType: prismaMediaType },
        _avg: { value: true },
        _count: { value: true },
      }),
      this.prisma.review.count({ where: { tmdbId, mediaType: prismaMediaType } }),
    ]);

    return {
      averageRating:
        ratingAggregate._avg.value == null
          ? null
          : Number(Number(ratingAggregate._avg.value).toFixed(1)),
      ratingsCount: ratingAggregate._count.value,
      reviewsCount,
    };
  }

  async viewerStateFor(userId: string, mediaType: MediaType, tmdbId: number) {
    const prismaMediaType = toPrismaMediaType(mediaType);
    const [rating, watchlist, watched, favorite] = await Promise.all([
      this.prisma.rating.findUnique({
        where: { userId_tmdbId_mediaType: { userId, tmdbId, mediaType: prismaMediaType } },
        select: { value: true },
      }),
      this.prisma.watchlistItem.findUnique({
        where: { userId_tmdbId_mediaType: { userId, tmdbId, mediaType: prismaMediaType } },
        select: { id: true },
      }),
      this.prisma.watchedItem.findUnique({
        where: { userId_tmdbId_mediaType: { userId, tmdbId, mediaType: prismaMediaType } },
        select: { id: true },
      }),
      this.prisma.favoriteItem.findUnique({
        where: { userId_tmdbId_mediaType: { userId, tmdbId, mediaType: prismaMediaType } },
        select: { id: true },
      }),
    ]);
    const lists = await this.prisma.customList.findMany({
      where: { ownerId: userId },
      include: {
        items: { where: { tmdbId, mediaType: prismaMediaType }, select: { id: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      rating: rating ? Number(rating.value) : null,
      inWatchlist: Boolean(watchlist),
      watched: Boolean(watched),
      favorite: Boolean(favorite),
      lists: lists.map((list) => ({
        id: list.id,
        title: list.title,
        isPrivate: list.isPrivate,
        containsMedia: list.items.length > 0,
        itemId: list.items[0]?.id ?? null,
      })),
    };
  }

  private async withFallback<T>(load: () => Promise<T>, fallback: T) {
    try {
      return await load();
    } catch {
      return fallback;
    }
  }

  private emptyViewerState() {
    return {
      rating: null,
      inWatchlist: false,
      watched: false,
      favorite: false,
    };
  }

  private toSummary(detail: MediaDetail): MediaSummary {
    return {
      tmdbId: detail.tmdbId,
      mediaType: detail.mediaType,
      title: detail.title,
      ...(detail.tagline ? { tagline: detail.tagline } : {}),
      overview: detail.overview,
      posterUrl: detail.posterUrl,
      backdropUrl: detail.backdropUrl,
      releaseDate: detail.releaseDate,
      genres: detail.genres,
      tmdbRating: detail.tmdbRating,
      buzzScore: detail.buzzScore,
    };
  }

  private fallbackSummary(mediaType: MediaType, tmdbId: number): MediaSummary {
    return {
      tmdbId,
      mediaType,
      title: `${mediaType === 'movie' ? 'Movie' : 'Series'} #${tmdbId}`,
      overview: 'Metadata is not available yet.',
      posterUrl: null,
      backdropUrl: null,
      releaseDate: null,
      genres: [],
      tmdbRating: 0,
      buzzScore: 0,
    };
  }
}
