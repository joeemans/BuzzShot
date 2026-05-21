import { Controller, Get, Inject, Query } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { envelope } from '../common/http.js';
import { toApiMediaType } from '../common/media.js';
import { userSummary } from '../common/user.js';
import { PrismaService } from '../database/prisma.service.js';
import { MediaService } from '../media/media.service.js';

@Controller('search')
export class SearchController {
  constructor(
    @Inject(MediaService) private readonly media: MediaService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  @Get()
  async search(@Query('q') query = '') {
    const normalized = query.trim();
    if (!normalized) {
      return envelope({ media: await this.media.search(''), users: [], reviews: [], lists: [] });
    }

    const [media, users, reviews, lists] = await Promise.all([
      this.media.search(normalized),
      this.prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: normalized, mode: 'insensitive' } },
            { profile: { displayName: { contains: normalized, mode: 'insensitive' } } },
          ],
        },
        include: { profile: true },
        take: 8,
      }),
      this.prisma.review.findMany({
        where: {
          OR: [
            { title: { contains: normalized, mode: 'insensitive' } },
            { body: { contains: normalized, mode: 'insensitive' } },
          ],
        },
        include: { user: { include: { profile: true } }, _count: { select: { likes: true, comments: true } } },
        take: 8,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customList.findMany({
        where: {
          isPrivate: false,
          OR: [
            { title: { contains: normalized, mode: 'insensitive' } },
            { description: { contains: normalized, mode: 'insensitive' } },
          ],
        },
        include: {
          owner: { include: { profile: true } },
          items: { orderBy: { position: 'asc' } },
          _count: { select: { likes: true, comments: true } },
        },
        take: 8,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return envelope({
      media,
      users: users.map((user) => userSummary(user)),
      reviews: await Promise.all(reviews.map((review) => this.serializeReview(review))),
      lists: await Promise.all(lists.map((list) => this.serializeList(list))),
    });
  }

  private async serializeReview(
    review: Prisma.ReviewGetPayload<{
      include: { user: { include: { profile: true } }; _count: { select: { likes: true; comments: true } } };
    }>,
  ) {
    const mediaType = toApiMediaType(review.mediaType);
    return {
      id: review.id,
      user: userSummary(review.user),
      media: await this.media.summary(mediaType, review.tmdbId),
      rating: Number(review.rating),
      title: review.title,
      body: review.body,
      hasSpoilers: review.hasSpoilers,
      likesCount: review._count.likes,
      commentsCount: review._count.comments,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    };
  }

  private async serializeList(
    list: Prisma.CustomListGetPayload<{
      include: {
        owner: { include: { profile: true } };
        items: { orderBy: { position: 'asc' } };
        _count: { select: { likes: true; comments: true } };
      };
    }>,
  ) {
    return {
      id: list.id,
      owner: userSummary(list.owner),
      title: list.title,
      description: list.description,
      isPrivate: list.isPrivate,
      items: await this.media.summaries(
        list.items.map((item) => ({ tmdbId: item.tmdbId, mediaType: toApiMediaType(item.mediaType) })),
      ),
      likesCount: list._count.likes,
      commentsCount: list._count.comments,
      updatedAt: list.updatedAt.toISOString(),
    };
  }
}
