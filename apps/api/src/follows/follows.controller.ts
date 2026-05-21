import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  Inject,
  NotFoundException,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ActivityVerb } from '@prisma/client';
import { ApiAuthGuard } from '../auth/api-auth.guard.js';
import { CurrentUser, type RequestUser } from '../auth/current-user.decorator.js';
import { FollowDto } from '../common/dto.js';
import { envelope } from '../common/http.js';
import { PrismaService } from '../database/prisma.service.js';

@UseGuards(ApiAuthGuard)
@Controller('follows')
export class FollowsController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Post()
  async follow(@CurrentUser() user: RequestUser, @Body() body: FollowDto) {
    const followingId = await this.targetUserId(body);
    if (followingId === user.id) throw new BadRequestException('You cannot follow yourself.');

    const follow = await this.prisma.follow.upsert({
      where: { followerId_followingId: { followerId: user.id, followingId } },
      update: {},
      create: { followerId: user.id, followingId },
    });
    await this.prisma.activityEvent.create({
      data: { actorId: user.id, verb: ActivityVerb.FOLLOWED, targetUserId: followingId },
    });
    await this.prisma.notification.create({
      data: {
        userId: followingId,
        type: 'user_followed',
        payload: {
          actorId: user.id,
          actorName: user.displayName,
          actorUsername: user.username,
          href: `/profile/${user.username}`,
        },
      },
    });
    return envelope({ id: follow.id, followingId, createdAt: follow.createdAt.toISOString() });
  }

  @HttpCode(204)
  @Delete()
  async unfollow(@CurrentUser() user: RequestUser, @Query() query: FollowDto) {
    const followingId = await this.targetUserId(query);
    await this.prisma.follow.deleteMany({ where: { followerId: user.id, followingId } });
  }

  private async targetUserId(input: FollowDto) {
    if (!input.userId && !input.username) throw new BadRequestException('Provide a userId or username.');
    const where = input.userId ? { id: input.userId } : { username: input.username?.trim().toLowerCase() ?? '' };
    const target = await this.prisma.user.findFirst({
      where,
      select: { id: true },
    });
    if (!target) throw new NotFoundException('User not found.');
    return target.id;
  }
}
