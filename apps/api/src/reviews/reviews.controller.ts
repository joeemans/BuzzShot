import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ActivityVerb, type Prisma } from '@prisma/client';
import { ApiAuthGuard } from '../auth/api-auth.guard.js';
import { CurrentUser, type RequestUser } from '../auth/current-user.decorator.js';
import { CommentDto, ReviewCreateDto, ReviewUpdateDto } from '../common/dto.js';
import { envelope } from '../common/http.js';
import { toApiMediaType, toPrismaMediaType } from '../common/media.js';
import { userSummary } from '../common/user.js';
import { PrismaService } from '../database/prisma.service.js';
import { MediaService } from '../media/media.service.js';

type ReviewRecord = Prisma.ReviewGetPayload<{
  include: {
    user: { include: { profile: true } };
    likes: { select: { userId: true } };
    _count: { select: { likes: true; comments: true } };
  };
}>;

type CommentRecord = Prisma.ReviewCommentGetPayload<{
  include: { user: { include: { profile: true } } };
}>;

@Controller('reviews')
export class ReviewsController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MediaService) private readonly media: MediaService,
  ) {}

  @Get()
  async list(
    @Query('tmdbId') tmdbId?: string,
    @Query('mediaType') mediaType?: 'movie' | 'series',
    @Query('username') username?: string,
  ) {
    const where: Prisma.ReviewWhereInput = {};
    if (tmdbId && mediaType) {
      where.tmdbId = Number(tmdbId);
      where.mediaType = toPrismaMediaType(mediaType);
    }
    if (username) {
      where.user = { username: username.trim().toLowerCase() };
    }

    const reviews = await this.prisma.review.findMany({
      where,
      include: this.reviewInclude(),
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    return envelope(await Promise.all(reviews.map((review) => this.serializeReview(review))));
  }

  @Get(':reviewId')
  async detail(@Param('reviewId') reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: this.reviewInclude(),
    });
    if (!review) throw new NotFoundException('Review not found.');
    return envelope(await this.serializeReview(review));
  }

  @UseGuards(ApiAuthGuard)
  @Post()
  async create(@CurrentUser() user: RequestUser, @Body() body: ReviewCreateDto) {
    const mediaType = toPrismaMediaType(body.mediaType);
    const title = this.reviewTitle(body.title, body.rating);
    const reviewBody = body.body?.trim() ?? '';
    const review = await this.prisma.$transaction(async (tx) => {
      const saved = await tx.review.upsert({
        where: { userId_tmdbId_mediaType: { userId: user.id, tmdbId: body.tmdbId, mediaType } },
        update: {
          rating: body.rating,
          title,
          body: reviewBody,
          hasSpoilers: reviewBody ? body.hasSpoilers : false,
        },
        create: {
          userId: user.id,
          tmdbId: body.tmdbId,
          mediaType,
          rating: body.rating,
          title,
          body: reviewBody,
          hasSpoilers: reviewBody ? body.hasSpoilers : false,
        },
        include: this.reviewInclude(),
      });
      await tx.rating.upsert({
        where: { userId_tmdbId_mediaType: { userId: user.id, tmdbId: body.tmdbId, mediaType } },
        update: { value: body.rating },
        create: { userId: user.id, tmdbId: body.tmdbId, mediaType, value: body.rating },
      });
      await tx.activityEvent.create({
        data: {
          actorId: user.id,
          verb: ActivityVerb.REVIEWED,
          tmdbId: body.tmdbId,
          mediaType,
          reviewId: saved.id,
        },
      });
      return saved;
    });
    return envelope(await this.serializeReview(review));
  }

  @UseGuards(ApiAuthGuard)
  @Patch(':reviewId')
  async update(
    @CurrentUser() user: RequestUser,
    @Param('reviewId') reviewId: string,
    @Body() body: ReviewUpdateDto,
  ) {
    const existing = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!existing) throw new NotFoundException('Review not found.');
    if (existing.userId !== user.id)
      throw new ForbiddenException('You can only edit your own reviews.');

    const review = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        ...body,
        ...(body.title !== undefined
          ? { title: this.reviewTitle(body.title, Number(body.rating ?? existing.rating)) }
          : {}),
        ...(body.body !== undefined ? { body: body.body.trim() } : {}),
      },
      include: this.reviewInclude(),
    });
    if (body.rating !== undefined) {
      await this.prisma.rating.upsert({
        where: {
          userId_tmdbId_mediaType: {
            userId: user.id,
            tmdbId: existing.tmdbId,
            mediaType: existing.mediaType,
          },
        },
        update: { value: body.rating },
        create: {
          userId: user.id,
          tmdbId: existing.tmdbId,
          mediaType: existing.mediaType,
          value: body.rating,
        },
      });
    }
    return envelope(await this.serializeReview(review));
  }

  @HttpCode(204)
  @UseGuards(ApiAuthGuard)
  @Delete(':reviewId')
  async remove(@CurrentUser() user: RequestUser, @Param('reviewId') reviewId: string) {
    const existing = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!existing) throw new NotFoundException('Review not found.');
    if (existing.userId !== user.id)
      throw new ForbiddenException('You can only delete your own reviews.');
    await this.prisma.review.delete({ where: { id: reviewId } });
  }

  @UseGuards(ApiAuthGuard)
  @Post(':reviewId/likes')
  async like(@CurrentUser() user: RequestUser, @Param('reviewId') reviewId: string) {
    await this.ensureReview(reviewId);
    await this.prisma.reviewLike.upsert({
      where: { userId_reviewId: { userId: user.id, reviewId } },
      update: {},
      create: { userId: user.id, reviewId },
    });
    return this.detail(reviewId);
  }

  @HttpCode(204)
  @UseGuards(ApiAuthGuard)
  @Delete(':reviewId/likes')
  async unlike(@CurrentUser() user: RequestUser, @Param('reviewId') reviewId: string) {
    await this.prisma.reviewLike.deleteMany({ where: { userId: user.id, reviewId } });
  }

  @Get(':reviewId/comments')
  async comments(@Param('reviewId') reviewId: string) {
    await this.ensureReview(reviewId);
    const comments = await this.prisma.reviewComment.findMany({
      where: { reviewId },
      include: { user: { include: { profile: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return envelope(comments.map((comment) => this.serializeComment(comment)));
  }

  @UseGuards(ApiAuthGuard)
  @Post(':reviewId/comments')
  async comment(
    @CurrentUser() user: RequestUser,
    @Param('reviewId') reviewId: string,
    @Body() body: CommentDto,
  ) {
    await this.ensureReview(reviewId);
    const comment = await this.prisma.reviewComment.create({
      data: { userId: user.id, reviewId, body: body.body },
      include: { user: { include: { profile: true } } },
    });
    return envelope(this.serializeComment(comment));
  }

  @HttpCode(204)
  @UseGuards(ApiAuthGuard)
  @Delete(':reviewId/comments/:commentId')
  async deleteComment(
    @CurrentUser() user: RequestUser,
    @Param('reviewId') reviewId: string,
    @Param('commentId') commentId: string,
  ) {
    const comment = await this.prisma.reviewComment.findUnique({ where: { id: commentId } });
    if (!comment || comment.reviewId !== reviewId)
      throw new NotFoundException('Comment not found.');
    if (comment.userId !== user.id)
      throw new ForbiddenException('You can only delete your own comments.');
    await this.prisma.reviewComment.delete({ where: { id: commentId } });
  }

  private reviewInclude() {
    return {
      user: { include: { profile: true } },
      likes: { select: { userId: true } },
      _count: { select: { likes: true, comments: true } },
    } satisfies Prisma.ReviewInclude;
  }

  private async ensureReview(reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true },
    });
    if (!review) throw new NotFoundException('Review not found.');
  }

  private async serializeReview(review: ReviewRecord) {
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

  private serializeComment(comment: CommentRecord) {
    return {
      id: comment.id,
      user: userSummary(comment.user),
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    };
  }

  private reviewTitle(title: string | undefined, rating: number) {
    const trimmed = title?.trim();
    return trimmed ? trimmed : `Rated ${Number(rating.toFixed(1))} stars`;
  }
}
