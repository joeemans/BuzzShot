import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { ApiAuthGuard } from '../auth/api-auth.guard.js';
import { CurrentUser, type RequestUser } from '../auth/current-user.decorator.js';
import { PaginationDto } from '../common/dto.js';
import { envelope } from '../common/http.js';
import { toApiMediaType, toApiVerb } from '../common/media.js';
import { pagination } from '../common/pagination.js';
import { userSummary } from '../common/user.js';
import { PrismaService } from '../database/prisma.service.js';
import { MediaService } from '../media/media.service.js';

type ActivityRecord = Prisma.ActivityEventGetPayload<{
  include: {
    actor: { include: { profile: true } };
    review: { include: { user: { include: { profile: true } }; _count: { select: { likes: true; comments: true } } } };
    list: { include: { owner: { include: { profile: true } }; items: { orderBy: { position: 'asc' } }; _count: { select: { likes: true; comments: true } } } };
  };
}>;

@UseGuards(ApiAuthGuard)
@Controller('feed')
export class FeedController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MediaService) private readonly media: MediaService,
  ) {}

  @Get()
  async feed(@CurrentUser() user: RequestUser, @Query() query: PaginationDto) {
    const { page, pageSize, skip } = pagination(query.page, query.pageSize);
    const following = await this.prisma.follow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    });
    const actorIds = [user.id, ...following.map((follow) => follow.followingId)];
    const where = {
      actorId: { in: actorIds },
      OR: [{ listId: null }, { list: { isPrivate: false } }, { list: { ownerId: user.id } }],
    } satisfies Prisma.ActivityEventWhereInput;

    const [items, total] = await Promise.all([
      this.prisma.activityEvent.findMany({
        where,
        include: this.activityInclude(),
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.activityEvent.count({ where }),
    ]);

    return envelope({
      items: await Promise.all(items.map((event) => this.serializeEvent(event))),
      total,
      page,
      pageSize,
    });
  }

  private activityInclude() {
    return {
      actor: { include: { profile: true } },
      review: { include: { user: { include: { profile: true } }, _count: { select: { likes: true, comments: true } } } },
      list: {
        include: {
          owner: { include: { profile: true } },
          items: { orderBy: { position: 'asc' } },
          _count: { select: { likes: true, comments: true } },
        },
      },
    } satisfies Prisma.ActivityEventInclude;
  }

  private async serializeEvent(event: ActivityRecord) {
    const media =
      event.tmdbId && event.mediaType ? await this.media.summary(toApiMediaType(event.mediaType), event.tmdbId) : undefined;
    const targetUser = event.targetUserId
      ? await this.prisma.user.findUnique({ where: { id: event.targetUserId }, include: { profile: true } })
      : null;

    return {
      id: event.id,
      actor: userSummary(event.actor),
      verb: toApiVerb(event.verb),
      ...(media ? { media } : {}),
      ...(event.review && media
        ? {
            review: {
              id: event.review.id,
              user: userSummary(event.review.user),
              media,
              rating: Number(event.review.rating),
              title: event.review.title,
              body: event.review.body,
              hasSpoilers: event.review.hasSpoilers,
              likesCount: event.review._count.likes,
              commentsCount: event.review._count.comments,
              createdAt: event.review.createdAt.toISOString(),
              updatedAt: event.review.updatedAt.toISOString(),
            },
          }
        : {}),
      ...(event.list
        ? {
            list: {
              id: event.list.id,
              owner: userSummary(event.list.owner),
              title: event.list.title,
              description: event.list.description,
              isPrivate: event.list.isPrivate,
              items: await this.media.summaries(
                event.list.items.map((item) => ({ tmdbId: item.tmdbId, mediaType: toApiMediaType(item.mediaType) })),
              ),
              likesCount: event.list._count.likes,
              commentsCount: event.list._count.comments,
              updatedAt: event.list.updatedAt.toISOString(),
            },
          }
        : {}),
      ...(targetUser ? { targetUser: userSummary(targetUser) } : {}),
      createdAt: event.createdAt.toISOString(),
    };
  }
}
