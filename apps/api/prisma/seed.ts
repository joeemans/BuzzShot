import { PrismaClient, MediaType } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('BuzzShotDemo123');
  const user = await prisma.user.upsert({
    where: { email: 'demo@buzzshot.local' },
    update: {},
    create: {
      email: 'demo@buzzshot.local',
      username: 'demo',
      passwordHash,
      profile: {
        create: {
          displayName: 'Demo User',
          bio: 'Seeded BuzzShot account for local QA.',
          favoriteGenres: ['Drama', 'Science Fiction'],
        },
      },
    },
  });

  await prisma.mediaCache.upsert({
    where: {
      tmdbId_mediaType_scope: {
        tmdbId: 157336,
        mediaType: MediaType.MOVIE,
        scope: 'details',
      },
    },
    update: {
      staleAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
    create: {
      tmdbId: 157336,
      mediaType: MediaType.MOVIE,
      scope: 'details',
      staleAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      payload: {
        title: 'Interstellar',
        seededFor: user.username,
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
