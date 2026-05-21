import { Inject, Injectable, Optional } from '@nestjs/common';
import type { MediaType as PrismaMediaType } from '@prisma/client';
import { demoMedia, demoRecommendations } from '../demo-data.js';
import { toApiMediaType } from '../common/media.js';
import { PrismaService } from '../database/prisma.service.js';
import { MediaService } from '../media/media.service.js';
import type { MediaSummary } from '../tmdb/tmdb.types.js';

type Candidate = {
  media: MediaSummary;
  score: number;
  reason: string;
};

@Injectable()
export class RecommendationsService {
  constructor(
    @Optional() @Inject(PrismaService) private readonly prisma?: PrismaService,
    @Optional() @Inject(MediaService) private readonly media?: MediaService,
  ) {}

  async forYou(userId?: string) {
    if (!userId || !this.prisma || !this.media) return demoRecommendations;

    const [ratings, watched, favorites, watchlist, profile, follows] = await Promise.all([
      this.prisma.rating.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' }, take: 20 }),
      this.prisma.watchedItem.findMany({ where: { userId }, select: { tmdbId: true, mediaType: true } }),
      this.prisma.favoriteItem.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 20 }),
      this.prisma.watchlistItem.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 20 }),
      this.prisma.profile.findUnique({ where: { userId } }),
      this.prisma.follow.findMany({ where: { followerId: userId }, select: { followingId: true } }),
    ]);

    const watchedKeys = new Set(watched.map((item) => this.key(toApiMediaType(item.mediaType), item.tmdbId)));
    const negativeGenres = await this.negativeGenres(ratings);
    const candidates = new Map<string, Candidate>();

    for (const rating of ratings.filter((item) => Number(item.value) >= 4).slice(0, 8)) {
      await this.addRelated(candidates, toApiMediaType(rating.mediaType), rating.tmdbId, 28, 'Because you rated a similar title highly.');
    }

    for (const favorite of favorites.slice(0, 8)) {
      await this.addRelated(candidates, toApiMediaType(favorite.mediaType), favorite.tmdbId, 24, 'Because you favorited a related title.');
    }

    for (const item of watchlist.slice(0, 6)) {
      await this.addRelated(candidates, toApiMediaType(item.mediaType), item.tmdbId, 10, 'Because it fits your watchlist.');
    }

    if (follows.length > 0) {
      const followedIds = follows.map((follow) => follow.followingId);
      const followedFavorites = await this.prisma.favoriteItem.findMany({
        where: { userId: { in: followedIds } },
        orderBy: { createdAt: 'desc' },
        take: 12,
      });
      for (const favorite of followedFavorites) {
        const media = await this.media.summary(toApiMediaType(favorite.mediaType), favorite.tmdbId);
        this.addCandidate(candidates, media, 18, 'Popular with people you follow.');
      }
    }

    if (candidates.size < 8) {
      for (const media of await this.media.trending()) {
        const genreBoost = media.genres.some((genre) => profile?.favoriteGenres.includes(genre)) ? 12 : 0;
        this.addCandidate(
          candidates,
          media,
          8 + genreBoost,
          genreBoost > 0 ? `Because you like ${profile?.favoriteGenres[0]}.` : 'Trending with BuzzShot members.',
        );
      }
    }

    const results = [...candidates.values()]
      .filter((candidate) => !watchedKeys.has(this.key(candidate.media.mediaType, candidate.media.tmdbId)))
      .map((candidate) => ({
        ...candidate,
        score: this.adjustScore(candidate, negativeGenres),
      }))
      .sort((left, right) => right.score - left.score)
      .slice(0, 20);

    await this.prisma.recommendationSnapshot.create({
      data: {
        userId,
        payload: results,
        staleAt: new Date(Date.now() + 1000 * 60 * 60 * 6),
      },
    });

    return results;
  }

  scoreGenres(positiveGenres: string[], negativeGenres: string[] = []) {
    return demoMedia
      .map((media) => {
        const positive = media.genres.filter((genre) => positiveGenres.includes(genre)).length * 15;
        const negative = media.genres.filter((genre) => negativeGenres.includes(genre)).length * -12;
        return {
          media,
          score: Math.max(0, Math.min(100, Math.round(media.buzzScore * 8 + positive + negative))),
          reason: positive > 0 ? `Because you liked ${positiveGenres[0]}.` : 'Trending with BuzzShot members.',
        };
      })
      .sort((left, right) => right.score - left.score);
  }

  private async addRelated(
    candidates: Map<string, Candidate>,
    mediaType: 'movie' | 'series',
    tmdbId: number,
    boost: number,
    reason: string,
  ) {
    if (!this.media) return;
    const detail = await this.media.detail(mediaType, tmdbId);
    const related = [...(detail?.recommendations.map((item) => item.media) ?? []), ...(detail?.similar ?? [])];
    for (const media of related.slice(0, 8)) {
      this.addCandidate(candidates, media, boost, reason.replace('similar title', detail?.title ?? 'a title you liked'));
    }
  }

  private addCandidate(candidates: Map<string, Candidate>, media: MediaSummary, boost: number, reason: string) {
    const key = this.key(media.mediaType, media.tmdbId);
    const current = candidates.get(key);
    const score = Math.min(100, Math.round(media.buzzScore * 8 + boost));
    if (!current || score > current.score) {
      candidates.set(key, { media, score, reason });
    }
  }

  private async negativeGenres(ratings: Array<{ mediaType: PrismaMediaType; tmdbId: number; value: unknown }>) {
    if (!this.media) return new Set<string>();
    const genres = new Set<string>();
    for (const rating of ratings.filter((item) => Number(item.value) <= 2).slice(0, 8)) {
      const mediaType = toApiMediaType(rating.mediaType);
      const summary = await this.media.summary(mediaType, rating.tmdbId);
      summary.genres.forEach((genre) => genres.add(genre));
    }
    return genres;
  }

  private adjustScore(candidate: Candidate, negativeGenres: Set<string>) {
    const penalty = candidate.media.genres.some((genre) => negativeGenres.has(genre)) ? 14 : 0;
    return Math.max(0, Math.min(100, candidate.score - penalty));
  }

  private key(mediaType: string, tmdbId: number) {
    return `${mediaType}:${tmdbId}`;
  }
}
