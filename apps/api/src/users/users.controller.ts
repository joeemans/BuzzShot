import { Controller, Get, Inject, Query } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { envelope } from '../common/http.js';
import { userSummary } from '../common/user.js';
import { PrismaService } from '../database/prisma.service.js';

@Controller('users')
export class UsersController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query('q') query = '') {
    const normalized = query.trim().toLowerCase();
    const where: Prisma.UserWhereInput | undefined = normalized
      ? {
          OR: [
            { username: { contains: normalized, mode: 'insensitive' } },
            { profile: { displayName: { contains: normalized, mode: 'insensitive' } } },
          ],
        }
      : undefined;
    const users = await this.prisma.user.findMany({
      ...(where ? { where } : {}),
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return envelope(users.map((user) => userSummary(user)));
  }
}
