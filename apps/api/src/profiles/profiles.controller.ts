import { Controller, Get, Inject, NotFoundException, Param } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { envelope } from '../common/http.js';
import { PrismaService } from '../database/prisma.service.js';
import { demoProfiles } from '../demo-data.js';

type ProfileResponse = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  favoriteGenres: string[];
  stats: {
    reviews: number;
    ratings: number;
    followers: number;
    following: number;
    lists: number;
  };
};

type UserProfileRecord = Prisma.UserGetPayload<{
  include: {
    profile: true;
    _count: {
      select: {
        reviews: true;
        ratings: true;
        followers: true;
        following: true;
        lists: true;
      };
    };
  };
}>;

@Controller('profiles')
export class ProfilesController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get(':username')
  async detail(@Param('username') usernameParam: string) {
    const username = usernameParam.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        profile: true,
        _count: {
          select: {
            reviews: true,
            ratings: true,
            followers: true,
            following: true,
            lists: true,
          },
        },
      },
    });

    if (user) return envelope(this.profileFor(user));

    const profile = demoProfiles.find((item) => item.username === username);
    if (!profile) throw new NotFoundException('Profile not found.');
    return envelope(profile);
  }

  private profileFor(user: UserProfileRecord): ProfileResponse {
    return {
      id: user.id,
      username: user.username,
      displayName: user.profile?.displayName ?? user.username,
      avatarUrl: user.profile?.avatarUrl ?? null,
      bio: user.profile?.bio ?? null,
      location: user.profile?.location ?? null,
      favoriteGenres: user.profile?.favoriteGenres ?? [],
      stats: {
        reviews: user._count.reviews,
        ratings: user._count.ratings,
        followers: user._count.followers,
        following: user._count.following,
        lists: user._count.lists,
      },
    };
  }
}
