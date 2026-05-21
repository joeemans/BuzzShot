import { MediaType as PrismaMediaType } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../database/prisma.service.js';
import type { MediaService } from '../media/media.service.js';
import { RecommendationsService } from './recommendations.service.js';

describe('RecommendationsService', () => {
  it('boosts liked genres and preserves explanations', () => {
    const service = new RecommendationsService();
    const results = service.scoreGenres(['Drama'], ['Horror']);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.reason).toContain('Because');
  });

  it('excludes watched titles and stores a snapshot', async () => {
    const prisma = {
      rating: {
        findMany: vi.fn().mockResolvedValue([
          { tmdbId: 1, mediaType: PrismaMediaType.MOVIE, value: 5 },
        ]),
      },
      watchedItem: {
        findMany: vi.fn().mockResolvedValue([{ tmdbId: 2, mediaType: PrismaMediaType.MOVIE }]),
      },
      favoriteItem: { findMany: vi.fn().mockResolvedValue([]) },
      watchlistItem: { findMany: vi.fn().mockResolvedValue([]) },
      profile: { findUnique: vi.fn().mockResolvedValue({ favoriteGenres: ['Drama'] }) },
      follow: { findMany: vi.fn().mockResolvedValue([]) },
      recommendationSnapshot: { create: vi.fn().mockResolvedValue({}) },
    } as unknown as PrismaService;
    const watchedMedia = media(2, 'Already Watched');
    const freshMedia = media(3, 'Fresh Pick');
    const mediaService = {
      detail: vi.fn().mockResolvedValue({
        ...media(1, 'Seed'),
        recommendations: [{ media: watchedMedia, score: 95, reason: 'Related.' }],
        similar: [freshMedia],
      }),
      trending: vi.fn().mockResolvedValue([]),
      summary: vi.fn().mockResolvedValue(freshMedia),
    } as unknown as MediaService;

    const service = new RecommendationsService(prisma, mediaService);
    const results = await service.forYou('user-1');

    expect(results.map((item) => item.media.tmdbId)).toEqual([3]);
    expect(prisma.recommendationSnapshot.create).toHaveBeenCalledOnce();
  });
});

function media(tmdbId: number, title: string) {
  return {
    tmdbId,
    mediaType: 'movie' as const,
    title,
    overview: '',
    posterUrl: null,
    backdropUrl: null,
    releaseDate: null,
    genres: ['Drama'],
    tmdbRating: 8,
    buzzScore: 8,
  };
}
