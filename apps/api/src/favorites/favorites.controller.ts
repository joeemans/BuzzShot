import { Body, Controller, Delete, Get, HttpCode, Inject, Post, Query, UseGuards } from '@nestjs/common';
import { ActivityVerb } from '@prisma/client';
import { ApiAuthGuard } from '../auth/api-auth.guard.js';
import { CurrentUser, type RequestUser } from '../auth/current-user.decorator.js';
import { MediaTargetDto } from '../common/dto.js';
import { envelope } from '../common/http.js';
import { toApiMediaType, toPrismaMediaType } from '../common/media.js';
import { PrismaService } from '../database/prisma.service.js';
import { MediaService } from '../media/media.service.js';

@UseGuards(ApiAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MediaService) private readonly media: MediaService,
  ) {}

  @Get()
  async list(@CurrentUser() user: RequestUser) {
    const items = await this.prisma.favoriteItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    return envelope(
      await this.media.summaries(items.map((item) => ({ tmdbId: item.tmdbId, mediaType: toApiMediaType(item.mediaType) }))),
    );
  }

  @Post()
  async add(@CurrentUser() user: RequestUser, @Body() body: MediaTargetDto) {
    const mediaType = toPrismaMediaType(body.mediaType);
    const item = await this.prisma.favoriteItem.upsert({
      where: { userId_tmdbId_mediaType: { userId: user.id, tmdbId: body.tmdbId, mediaType } },
      update: {},
      create: { userId: user.id, tmdbId: body.tmdbId, mediaType },
    });
    await this.prisma.activityEvent.create({
      data: { actorId: user.id, verb: ActivityVerb.FAVORITED, tmdbId: body.tmdbId, mediaType },
    });
    return envelope(await this.media.summary(toApiMediaType(item.mediaType), item.tmdbId));
  }

  @HttpCode(204)
  @Delete()
  async remove(@CurrentUser() user: RequestUser, @Query() query: MediaTargetDto) {
    await this.prisma.favoriteItem.deleteMany({
      where: {
        userId: user.id,
        tmdbId: query.tmdbId,
        mediaType: toPrismaMediaType(query.mediaType),
      },
    });
  }
}
