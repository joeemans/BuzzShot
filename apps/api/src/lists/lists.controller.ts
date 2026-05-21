import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ActivityVerb, Prisma as PrismaNamespace, type Prisma } from '@prisma/client';
import type { Request } from 'express';
import { ApiAuthGuard } from '../auth/api-auth.guard.js';
import { AuthService } from '../auth/auth.service.js';
import { CurrentUser, type RequestUser } from '../auth/current-user.decorator.js';
import { CommentDto, CustomListDto, CustomListItemDto, ReorderListItemDto } from '../common/dto.js';
import { envelope } from '../common/http.js';
import { toApiMediaType, toPrismaMediaType } from '../common/media.js';
import { userSummary } from '../common/user.js';
import type { Env } from '../config/env.js';
import { PrismaService } from '../database/prisma.service.js';
import { MediaService } from '../media/media.service.js';

type ListRecord = Prisma.CustomListGetPayload<{
  include: {
    owner: { include: { profile: true } };
    items: { orderBy: { position: 'asc' } };
    likes: { select: { userId: true } };
    followers: { select: { userId: true } };
    _count: { select: { likes: true; comments: true; followers: true } };
  };
}>;

type ListCommentRecord = Prisma.CustomListCommentGetPayload<{
  include: { user: { include: { profile: true } } };
}>;

@Controller('lists')
export class ListsController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MediaService) private readonly media: MediaService,
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(ConfigService) private readonly config: ConfigService<Env, true>,
  ) {}

  @Get()
  async list(
    @Headers('authorization') authorization: string | undefined,
    @Req() request: Request,
    @Query('username') username?: string,
  ) {
    const viewerId = await this.viewerId(authorization, request);
    const lists = await this.prisma.customList.findMany({
      where: {
        AND: [
          username ? { owner: { username: username.trim().toLowerCase() } } : {},
          { OR: [{ isPrivate: false }, ...(viewerId ? [{ ownerId: viewerId }] : [])] },
        ],
      },
      include: this.listInclude(),
      orderBy: { updatedAt: 'desc' },
      take: 30,
    });
    return envelope(await Promise.all(lists.map((list) => this.serializeList(list, viewerId))));
  }

  @UseGuards(ApiAuthGuard)
  @Get('mine')
  async mine(
    @CurrentUser() user: RequestUser,
    @Query('tmdbId') tmdbId?: string,
    @Query('mediaType') mediaType?: 'movie' | 'series',
  ) {
    const prismaMediaType = mediaType ? toPrismaMediaType(mediaType) : null;
    const lists = await this.prisma.customList.findMany({
      where: { ownerId: user.id },
      include: {
        items: prismaMediaType && tmdbId ? { where: { tmdbId: Number(tmdbId), mediaType: prismaMediaType } } : true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return envelope(
      lists.map((list) => ({
        id: list.id,
        title: list.title,
        isPrivate: list.isPrivate,
        containsMedia: list.items.length > 0,
        itemId: list.items[0]?.id ?? null,
      })),
    );
  }

  @Get(':listId')
  async detail(
    @Param('listId') listId: string,
    @Headers('authorization') authorization: string | undefined,
    @Req() request: Request,
  ) {
    const viewerId = await this.viewerId(authorization, request);
    const list = await this.prisma.customList.findUnique({
      where: { id: listId },
      include: this.listInclude(),
    });
    if (!list) throw new NotFoundException('List not found.');
    this.assertListVisible(list, viewerId);
    return envelope(await this.serializeList(list, viewerId));
  }

  @UseGuards(ApiAuthGuard)
  @Post()
  async create(@CurrentUser() user: RequestUser, @Body() body: CustomListDto) {
    const list = await this.prisma.customList.create({
      data: {
        ownerId: user.id,
        title: body.title,
        description: body.description,
        isPrivate: body.isPrivate,
      },
      include: this.listInclude(),
    });
    await this.prisma.activityEvent.create({
      data: { actorId: user.id, verb: ActivityVerb.LISTED, listId: list.id },
    });
    return envelope(await this.serializeList(list, user.id));
  }

  @UseGuards(ApiAuthGuard)
  @Patch(':listId')
  async update(@CurrentUser() user: RequestUser, @Param('listId') listId: string, @Body() body: CustomListDto) {
    await this.assertOwner(listId, user.id);
    const list = await this.prisma.customList.update({
      where: { id: listId },
      data: body,
      include: this.listInclude(),
    });
    return envelope(await this.serializeList(list, user.id));
  }

  @HttpCode(204)
  @UseGuards(ApiAuthGuard)
  @Delete(':listId')
  async remove(@CurrentUser() user: RequestUser, @Param('listId') listId: string) {
    await this.assertOwner(listId, user.id);
    await this.prisma.customList.delete({ where: { id: listId } });
  }

  @UseGuards(ApiAuthGuard)
  @Post(':listId/items')
  async addItem(@CurrentUser() user: RequestUser, @Param('listId') listId: string, @Body() body: CustomListItemDto) {
    await this.assertOwner(listId, user.id);
    const mediaType = toPrismaMediaType(body.mediaType);
    const position = body.position ?? (await this.prisma.customListItem.count({ where: { listId } }));
    const item = await this.prisma.customListItem.upsert({
      where: { listId_tmdbId_mediaType: { listId, tmdbId: body.tmdbId, mediaType } },
      update: { position },
      create: { listId, tmdbId: body.tmdbId, mediaType, position },
    });
    await this.prisma.activityEvent.create({
      data: { actorId: user.id, verb: ActivityVerb.LISTED, listId, tmdbId: body.tmdbId, mediaType },
    });
    await this.notifyListFollowers(listId, user.id, item.id);
    const list = await this.prisma.customList.findUniqueOrThrow({ where: { id: listId }, include: this.listInclude() });
    return envelope(await this.serializeList(list, user.id));
  }

  @UseGuards(ApiAuthGuard)
  @Patch(':listId/items/:itemId')
  async reorderItem(
    @CurrentUser() user: RequestUser,
    @Param('listId') listId: string,
    @Param('itemId') itemId: string,
    @Body() body: ReorderListItemDto,
  ) {
    await this.assertOwner(listId, user.id);
    await this.prisma.customListItem.update({ where: { id: itemId, listId }, data: { position: body.position } });
    const list = await this.prisma.customList.findUniqueOrThrow({ where: { id: listId }, include: this.listInclude() });
    return envelope(await this.serializeList(list, user.id));
  }

  @HttpCode(204)
  @UseGuards(ApiAuthGuard)
  @Delete(':listId/items/:itemId')
  async removeItem(@CurrentUser() user: RequestUser, @Param('listId') listId: string, @Param('itemId') itemId: string) {
    await this.assertOwner(listId, user.id);
    await this.prisma.customListItem.deleteMany({ where: { id: itemId, listId } });
  }

  @HttpCode(204)
  @UseGuards(ApiAuthGuard)
  @Delete(':listId/items')
  async removeItemByMedia(
    @CurrentUser() user: RequestUser,
    @Param('listId') listId: string,
    @Query('tmdbId') tmdbId: string,
    @Query('mediaType') mediaType: 'movie' | 'series',
  ) {
    await this.assertOwner(listId, user.id);
    if (!tmdbId || (mediaType !== 'movie' && mediaType !== 'series')) {
      throw new BadRequestException('Provide tmdbId and mediaType.');
    }
    await this.prisma.customListItem.deleteMany({
      where: { listId, tmdbId: Number(tmdbId), mediaType: toPrismaMediaType(mediaType) },
    });
  }

  @UseGuards(ApiAuthGuard)
  @Post(':listId/likes')
  async like(@CurrentUser() user: RequestUser, @Param('listId') listId: string) {
    const list = await this.listForAccess(listId, user.id);
    await this.prisma.customListLike.upsert({
      where: { userId_listId: { userId: user.id, listId } },
      update: {},
      create: { userId: user.id, listId },
    });
    return envelope(await this.serializeList(list, user.id));
  }

  @HttpCode(204)
  @UseGuards(ApiAuthGuard)
  @Delete(':listId/likes')
  async unlike(@CurrentUser() user: RequestUser, @Param('listId') listId: string) {
    await this.prisma.customListLike.deleteMany({ where: { userId: user.id, listId } });
  }

  @UseGuards(ApiAuthGuard)
  @Post(':listId/follows')
  async follow(@CurrentUser() user: RequestUser, @Param('listId') listId: string) {
    const list = await this.listForAccess(listId, user.id);
    if (list.ownerId === user.id) throw new BadRequestException('You already own this list.');
    await this.prisma.customListFollow.upsert({
      where: { userId_listId: { userId: user.id, listId } },
      update: {},
      create: { userId: user.id, listId },
    });
    await this.prisma.notification.create({
      data: {
        userId: list.ownerId,
        type: 'list_followed',
        payload: {
          listId,
          listTitle: list.title,
          actorId: user.id,
          actorName: user.displayName,
          href: `/lists/${listId}`,
        },
      },
    });
    const updated = await this.prisma.customList.findUniqueOrThrow({ where: { id: listId }, include: this.listInclude() });
    return envelope(await this.serializeList(updated, user.id));
  }

  @HttpCode(204)
  @UseGuards(ApiAuthGuard)
  @Delete(':listId/follows')
  async unfollow(@CurrentUser() user: RequestUser, @Param('listId') listId: string) {
    await this.prisma.customListFollow.deleteMany({ where: { userId: user.id, listId } });
  }

  @Get(':listId/comments')
  async comments(
    @Param('listId') listId: string,
    @Headers('authorization') authorization: string | undefined,
    @Req() request: Request,
  ) {
    await this.listForAccess(listId, await this.viewerId(authorization, request));
    const comments = await this.prisma.customListComment.findMany({
      where: { listId },
      include: { user: { include: { profile: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return envelope(comments.map((comment) => this.serializeComment(comment)));
  }

  @UseGuards(ApiAuthGuard)
  @Post(':listId/comments')
  async comment(@CurrentUser() user: RequestUser, @Param('listId') listId: string, @Body() body: CommentDto) {
    await this.listForAccess(listId, user.id);
    const comment = await this.prisma.customListComment.create({
      data: { userId: user.id, listId, body: body.body },
      include: { user: { include: { profile: true } } },
    });
    return envelope(this.serializeComment(comment));
  }

  private listInclude() {
    return {
      owner: { include: { profile: true } },
      items: { orderBy: { position: 'asc' } },
      likes: { select: { userId: true } },
      followers: { select: { userId: true } },
      _count: { select: { likes: true, comments: true, followers: true } },
    } satisfies Prisma.CustomListInclude;
  }

  private async serializeList(list: ListRecord, viewerId: string | null) {
    return {
      id: list.id,
      owner: userSummary(list.owner),
      title: list.title,
      description: list.description,
      isPrivate: list.isPrivate,
      items: await this.media.summaries(
        list.items.map((item) => ({ tmdbId: item.tmdbId, mediaType: toApiMediaType(item.mediaType) })),
      ),
      listItems: await Promise.all(
        list.items.map(async (item) => ({
          id: item.id,
          media: await this.media.summary(toApiMediaType(item.mediaType), item.tmdbId),
          position: item.position,
          createdAt: item.createdAt.toISOString(),
        })),
      ),
      likesCount: list._count.likes,
      commentsCount: list._count.comments,
      followersCount: list._count.followers,
      updatedAt: list.updatedAt.toISOString(),
      likedByViewer: viewerId ? list.likes.some((like) => like.userId === viewerId) : false,
      followedByViewer: viewerId ? list.followers.some((follow) => follow.userId === viewerId) : false,
      viewerCanEdit: viewerId === list.ownerId,
    };
  }

  private serializeComment(comment: ListCommentRecord) {
    return {
      id: comment.id,
      user: userSummary(comment.user),
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    };
  }

  private async assertOwner(listId: string, userId: string) {
    const list = await this.prisma.customList.findUnique({ where: { id: listId }, select: { ownerId: true } });
    if (!list) throw new NotFoundException('List not found.');
    if (list.ownerId !== userId) throw new ForbiddenException('You can only edit your own lists.');
  }

  private async listForAccess(listId: string, viewerId: string | null) {
    const list = await this.prisma.customList.findUnique({ where: { id: listId }, include: this.listInclude() });
    if (!list) throw new NotFoundException('List not found.');
    this.assertListVisible(list, viewerId);
    return list;
  }

  private assertListVisible(list: Pick<ListRecord, 'isPrivate' | 'ownerId'>, viewerId: string | null) {
    if (list.isPrivate && list.ownerId !== viewerId) {
      throw new NotFoundException('List not found.');
    }
  }

  private viewerId(authorization: string | undefined, request: Request) {
    const cookies = request.cookies as Record<string, string | undefined> | undefined;
    return this.auth.resolveUserId({
      authorization,
      refreshToken: cookies?.[this.config.get('REFRESH_TOKEN_COOKIE_NAME', { infer: true })],
    });
  }

  private async notifyListFollowers(listId: string, actorId: string, itemId: string) {
    const list = await this.prisma.customList.findUnique({
      where: { id: listId },
      include: {
        owner: { include: { profile: true } },
        followers: { select: { userId: true } },
        items: { where: { id: itemId } },
      },
    });
    const item = list?.items[0];
    if (!list || !item) return;
    const media = await this.media.summary(toApiMediaType(item.mediaType), item.tmdbId);
    const recipients = [...new Set(list.followers.map((follow) => follow.userId).filter((userId) => userId !== actorId))];
    if (recipients.length === 0) return;
    await this.prisma.notification.createMany({
      data: recipients.map((userId) => ({
        userId,
        type: 'list_item_added',
        payload: {
          listId,
          listTitle: list.title,
          itemId,
          tmdbId: item.tmdbId,
          mediaType: toApiMediaType(item.mediaType),
          mediaTitle: media.title,
          actorId,
          actorName: userSummary(list.owner).displayName,
          href: `/lists/${listId}`,
        } satisfies PrismaNamespace.InputJsonObject,
      })),
    });
  }
}
