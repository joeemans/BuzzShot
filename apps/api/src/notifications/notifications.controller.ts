import { Body, Controller, Get, HttpCode, Inject, Patch, Query, UseGuards } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { ApiAuthGuard } from '../auth/api-auth.guard.js';
import { CurrentUser, type RequestUser } from '../auth/current-user.decorator.js';
import { NotificationReadDto, PaginationDto } from '../common/dto.js';
import { envelope } from '../common/http.js';
import { toApiMediaType, toApiVerb } from '../common/media.js';
import { pagination } from '../common/pagination.js';
import { userSummary } from '../common/user.js';
import { PrismaService } from '../database/prisma.service.js';
import { MediaService } from '../media/media.service.js';

type NotificationRecord = Prisma.NotificationGetPayload<object>;
type ActivityRecord = Prisma.ActivityEventGetPayload<{
  include: {
    actor: { include: { profile: true } };
    list: true;
  };
}>;

@UseGuards(ApiAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MediaService) private readonly media: MediaService,
  ) {}

  @Get()
  async list(@CurrentUser() user: RequestUser, @Query() query: PaginationDto) {
    const { page, pageSize } = pagination(query.page, query.pageSize);
    const [stored, followedActivities] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: pageSize,
      }),
      this.followedActivity(user.id, Math.max(10, pageSize)),
    ]);

    const items = [
      ...stored.map((notification) => this.serializeNotification(notification)),
      ...(await Promise.all(followedActivities.map((activity) => this.serializeActivity(activity)))),
    ]
      .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
      .slice((page - 1) * pageSize, page * pageSize);

    return envelope({
      items,
      total: stored.length + followedActivities.length,
      page,
      pageSize,
    });
  }

  @HttpCode(204)
  @Patch('read')
  async markRead(@CurrentUser() user: RequestUser, @Body() body: NotificationReadDto) {
    await this.prisma.notification.updateMany({
      where: {
        userId: user.id,
        readAt: null,
        ...(body.ids?.length ? { id: { in: body.ids } } : {}),
      },
      data: { readAt: new Date() },
    });
  }

  private async followedActivity(userId: string, take: number) {
    const [followedUsers, followedLists] = await Promise.all([
      this.prisma.follow.findMany({ where: { followerId: userId }, select: { followingId: true } }),
      this.prisma.customListFollow.findMany({ where: { userId }, select: { listId: true } }),
    ]);
    const actorIds = followedUsers.map((follow) => follow.followingId);
    const listIds = followedLists.map((follow) => follow.listId);
    if (actorIds.length === 0 && listIds.length === 0) return [];

    return this.prisma.activityEvent.findMany({
      where: {
        OR: [{ actorId: { in: actorIds } }, { listId: { in: listIds } }],
      },
      include: {
        actor: { include: { profile: true } },
        list: true,
      },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  private serializeNotification(notification: NotificationRecord) {
    const payload = this.objectPayload(notification.payload);
    const title = this.notificationTitle(notification.type, payload);
    return {
      id: notification.id,
      type: notification.type,
      title,
      body: this.notificationBody(notification.type, payload),
      href: this.stringPayload(payload.href, '/notifications'),
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
    };
  }

  private async serializeActivity(activity: ActivityRecord) {
    const media =
      activity.tmdbId && activity.mediaType ? await this.media.summary(toApiMediaType(activity.mediaType), activity.tmdbId) : null;
    const actor = userSummary(activity.actor);
    const label = media?.title ?? activity.list?.title ?? 'BuzzShot';
    const href = media
      ? `/${media.mediaType === 'movie' ? 'movie' : 'series'}/${media.tmdbId}`
      : activity.list
        ? `/lists/${activity.list.id}`
        : `/profile/${actor.username}`;

    return {
      id: `activity:${activity.id}`,
      type: `followed_${toApiVerb(activity.verb)}`,
      title: `${actor.displayName} ${toApiVerb(activity.verb)}`,
      body: label,
      href,
      readAt: null,
      createdAt: activity.createdAt.toISOString(),
    };
  }

  private notificationTitle(type: string, payload: Record<string, unknown>) {
    if (type === 'list_item_added') return `New in ${this.stringPayload(payload.listTitle, 'a followed list')}`;
    if (type === 'list_followed') return `${this.stringPayload(payload.actorName, 'Someone')} followed your list`;
    if (type === 'user_followed') return `${this.stringPayload(payload.actorName, 'Someone')} followed you`;
    return 'BuzzShot update';
  }

  private notificationBody(type: string, payload: Record<string, unknown>) {
    if (type === 'list_item_added') return this.stringPayload(payload.mediaTitle, 'A title was added.');
    if (type === 'list_followed') return this.stringPayload(payload.listTitle, 'Your list has a new follower.');
    if (type === 'user_followed') return 'Open their profile.';
    return 'Open BuzzShot for details.';
  }

  private objectPayload(value: Prisma.JsonValue) {
    return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : {};
  }

  private stringPayload(value: unknown, fallback: string) {
    return typeof value === 'string' && value.length > 0 ? value : fallback;
  }
}
