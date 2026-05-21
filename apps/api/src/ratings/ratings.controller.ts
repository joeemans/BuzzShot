import { Body, Controller, Delete, HttpCode, Inject, Post, Query, UseGuards } from '@nestjs/common';
import { ActivityVerb } from '@prisma/client';
import { ApiAuthGuard } from '../auth/api-auth.guard.js';
import { CurrentUser, type RequestUser } from '../auth/current-user.decorator.js';
import { MediaTargetDto, RatingDto } from '../common/dto.js';
import { envelope } from '../common/http.js';
import { toPrismaMediaType } from '../common/media.js';
import { PrismaService } from '../database/prisma.service.js';

@UseGuards(ApiAuthGuard)
@Controller('ratings')
export class RatingsController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Post()
  async upsert(@CurrentUser() user: RequestUser, @Body() body: RatingDto) {
    const mediaType = toPrismaMediaType(body.mediaType);
    const rating = await this.prisma.rating.upsert({
      where: { userId_tmdbId_mediaType: { userId: user.id, tmdbId: body.tmdbId, mediaType } },
      update: { value: body.value },
      create: { userId: user.id, tmdbId: body.tmdbId, mediaType, value: body.value },
    });

    await this.prisma.activityEvent.create({
      data: {
        actorId: user.id,
        verb: ActivityVerb.RATED,
        tmdbId: body.tmdbId,
        mediaType,
      },
    });

    return envelope({
      id: rating.id,
      tmdbId: rating.tmdbId,
      mediaType: body.mediaType,
      value: Number(rating.value),
      createdAt: rating.createdAt.toISOString(),
      updatedAt: rating.updatedAt.toISOString(),
    });
  }

  @HttpCode(204)
  @Delete()
  async remove(@CurrentUser() user: RequestUser, @Query() query: MediaTargetDto) {
    await this.prisma.rating.deleteMany({
      where: {
        userId: user.id,
        tmdbId: query.tmdbId,
        mediaType: toPrismaMediaType(query.mediaType),
      },
    });
  }
}
