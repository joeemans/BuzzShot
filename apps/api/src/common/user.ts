import type { Prisma } from '@prisma/client';

export type UserRecord = Prisma.UserGetPayload<{ include: { profile: true } }>;

export function userSummary(user: UserRecord) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.profile?.displayName ?? user.username,
    avatarUrl: user.profile?.avatarUrl ?? null,
    bio: user.profile?.bio ?? null,
  };
}
