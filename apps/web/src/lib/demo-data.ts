import type {
  ActivityEvent,
  CustomList,
  MediaDetail,
  MediaSummary,
  Profile,
  Recommendation,
  Review,
  UserSummary,
} from '@buzzshot/shared';

const poster = (path: string) => `https://image.tmdb.org/t/p/w500${path}`;
const backdrop = (path: string) => `https://image.tmdb.org/t/p/original${path}`;
const avatar = (seed: string) => `https://api.dicebear.com/9.x/initials/svg?seed=${seed}`;

export const users: UserSummary[] = [
  {
    id: 'u_ada',
    username: 'adacuts',
    displayName: 'Ada Moreno',
    avatarUrl: avatar('Ada Moreno'),
    bio: 'Cuts through prestige TV and patient thrillers.',
  },
  {
    id: 'u_noor',
    username: 'noirnoor',
    displayName: 'Noor Haddad',
    avatarUrl: avatar('Noor Haddad'),
    bio: 'Crime films, slow cinema, and lists with arguments.',
  },
  {
    id: 'u_milo',
    username: 'milowatches',
    displayName: 'Milo Grant',
    avatarUrl: avatar('Milo Grant'),
    bio: 'Tracking everything from studio blockbusters to festival sleepers.',
  },
];

export const mediaItems: MediaSummary[] = [
  {
    tmdbId: 157336,
    mediaType: 'movie',
    title: 'Interstellar',
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    overview:
      'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survives beyond a failing Earth.',
    posterUrl: poster('/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'),
    backdropUrl: backdrop('/pbrkL804c8yAv3zBZR4QPEafpAR.jpg'),
    releaseDate: '2014-11-05',
    genres: ['Science Fiction', 'Drama', 'Adventure'],
    tmdbRating: 8.4,
    buzzScore: 9.3,
  },
  {
    tmdbId: 155,
    mediaType: 'movie',
    title: 'The Dark Knight',
    tagline: 'Welcome to a world without rules.',
    overview:
      'Batman, Gordon, and Harvey Dent are forced to confront an anarchic criminal mastermind who wants Gotham to burn.',
    posterUrl: poster('/qJ2tW6WMUDux911r6m7haRef0WH.jpg'),
    backdropUrl: backdrop('/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg'),
    releaseDate: '2008-07-16',
    genres: ['Action', 'Crime', 'Drama'],
    tmdbRating: 8.5,
    buzzScore: 9.1,
  },
  {
    tmdbId: 496243,
    mediaType: 'movie',
    title: 'Parasite',
    overview:
      'A struggling family finds a way into a wealthy household, triggering a chain of class tension and deception.',
    posterUrl: poster('/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg'),
    backdropUrl: backdrop('/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg'),
    releaseDate: '2019-05-30',
    genres: ['Thriller', 'Drama', 'Comedy'],
    tmdbRating: 8.5,
    buzzScore: 9.4,
  },
  {
    tmdbId: 872585,
    mediaType: 'movie',
    title: 'Oppenheimer',
    overview:
      'The story of J. Robert Oppenheimer and the creation of the atomic bomb during a defining scientific and moral race.',
    posterUrl: poster('/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg'),
    backdropUrl: backdrop('/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg'),
    releaseDate: '2023-07-19',
    genres: ['Drama', 'History'],
    tmdbRating: 8.1,
    buzzScore: 8.8,
  },
  {
    tmdbId: 550,
    mediaType: 'movie',
    title: 'Fight Club',
    overview:
      'An alienated office worker and a charismatic soap salesman build an underground movement that spirals beyond control.',
    posterUrl: poster('/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg'),
    backdropUrl: backdrop('/hZkgoQYus5vegHoetLkCJzb17zJ.jpg'),
    releaseDate: '1999-10-15',
    genres: ['Drama'],
    tmdbRating: 8.4,
    buzzScore: 8.6,
  },
  {
    tmdbId: 680,
    mediaType: 'movie',
    title: 'Pulp Fiction',
    overview:
      'Interwoven stories of criminals, boxers, and fixers collide across Los Angeles in a landmark nonlinear crime film.',
    posterUrl: poster('/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg'),
    backdropUrl: backdrop('/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg'),
    releaseDate: '1994-09-10',
    genres: ['Crime', 'Drama'],
    tmdbRating: 8.5,
    buzzScore: 8.9,
  },
  {
    tmdbId: 1396,
    mediaType: 'series',
    title: 'Breaking Bad',
    overview:
      'A chemistry teacher diagnosed with cancer turns to manufacturing methamphetamine, dragging his family and city into danger.',
    posterUrl: poster('/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg'),
    backdropUrl: backdrop('/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg'),
    releaseDate: '2008-01-20',
    genres: ['Drama', 'Crime'],
    tmdbRating: 8.9,
    buzzScore: 9.6,
  },
  {
    tmdbId: 1398,
    mediaType: 'series',
    title: 'The Sopranos',
    overview:
      'A New Jersey mob boss balances the violence of organized crime with therapy, panic attacks, and family pressure.',
    posterUrl: poster('/rTc7ZXdroqjkKivFPvCPX0Ru7uw.jpg'),
    backdropUrl: backdrop('/x4salpjB11umlUOltfNvSSrjSXm.jpg'),
    releaseDate: '1999-01-10',
    genres: ['Drama', 'Crime'],
    tmdbRating: 8.6,
    buzzScore: 9.5,
  },
  {
    tmdbId: 60625,
    mediaType: 'series',
    title: 'Rick and Morty',
    overview:
      'A cynical scientist pulls his anxious grandson into chaotic interdimensional adventures.',
    posterUrl: poster('/gdIrmf2DdY5mgN6ycVP0XlzKzbE.jpg'),
    backdropUrl: backdrop('/A3m5GJu5kzAKK2wkGlzErlCCElT.jpg'),
    releaseDate: '2013-12-02',
    genres: ['Animation', 'Comedy', 'Science Fiction'],
    tmdbRating: 8.7,
    buzzScore: 8.3,
  },
  {
    tmdbId: 66732,
    mediaType: 'series',
    title: 'Stranger Things',
    overview:
      'A group of kids uncover secret experiments and supernatural threats in a small Indiana town.',
    posterUrl: poster('/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg'),
    backdropUrl: backdrop('/56v2KjBlU4XaOv9rVYEQypROD7P.jpg'),
    releaseDate: '2016-07-15',
    genres: ['Drama', 'Fantasy', 'Horror'],
    tmdbRating: 8.6,
    buzzScore: 8.5,
  },
  {
    tmdbId: 94605,
    mediaType: 'series',
    title: 'Arcane',
    overview:
      'Two sisters on opposite sides of a class war become central to a city transformed by unstable magic and technology.',
    posterUrl: poster('/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg'),
    backdropUrl: backdrop('/rkB4LyZHo1NHXFEDHl9vSD9r1lI.jpg'),
    releaseDate: '2021-11-06',
    genres: ['Animation', 'Drama', 'Fantasy'],
    tmdbRating: 8.8,
    buzzScore: 9.2,
  },
  {
    tmdbId: 76479,
    mediaType: 'series',
    title: 'The Boys',
    overview:
      'A vigilante group takes on corrupt superheroes whose public heroism hides corporate manipulation and abuse.',
    posterUrl: poster('/stTEycfG9928HYGEISBFaG1ngjM.jpg'),
    backdropUrl: backdrop('/mGVrXeIjyecj6TKmwPVpHlscEmw.jpg'),
    releaseDate: '2019-07-25',
    genres: ['Action', 'Comedy', 'Drama'],
    tmdbRating: 8.5,
    buzzScore: 8.7,
  },
];

export const recommendations: Recommendation[] = mediaItems.slice(0, 8).map((media, index) => ({
  media,
  score: 96 - index * 4,
  reason:
    index % 2 === 0
      ? `Because you liked ${media.genres[0]} stories with high BuzzShot scores.`
      : `Popular with people who follow ${users[index % users.length]?.displayName ?? 'BuzzShot members'}.`,
}));

export const details: MediaDetail[] = mediaItems.map((media, index) => ({
  ...media,
  ...(media.mediaType === 'movie'
    ? { runtimeMinutes: 142 + (index % 4) * 9 }
    : { seasons: 3 + (index % 4) }),
  status: media.mediaType === 'movie' ? 'Released' : 'Returning Series',
  trailerUrl: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(`${media.title} trailer`),
  cast: [
    {
      id: index * 10 + 1,
      name: 'Featured Lead',
      character: 'Lead',
      avatarUrl: avatar(`${media.title} lead`),
    },
    {
      id: index * 10 + 2,
      name: 'Supporting Role',
      character: 'Supporting',
      avatarUrl: avatar(`${media.title} support`),
    },
    {
      id: index * 10 + 3,
      name: 'Scene Stealer',
      character: 'Key Role',
      avatarUrl: avatar(`${media.title} cast`),
    },
  ],
  similar: mediaItems
    .filter((item) => item.tmdbId !== media.tmdbId && item.mediaType === media.mediaType)
    .slice(0, 5),
  recommendations: recommendations.filter((item) => item.media.tmdbId !== media.tmdbId).slice(0, 4),
}));

export const profiles: Profile[] = users.map((user, index) => ({
  ...user,
  location: ['Cairo', 'Berlin', 'Toronto'][index] ?? 'Remote',
  favoriteGenres: [['Drama', 'Crime'], ['Thriller', 'Mystery'], ['Science Fiction', 'Animation']][index] ?? [
    'Drama',
  ],
  stats: {
    reviews: 24 + index * 7,
    ratings: 140 + index * 31,
    followers: 420 + index * 88,
    following: 160 + index * 33,
    lists: 6 + index,
  },
}));

export const reviews: Review[] = [
  {
    id: 'rev_interstellar',
    user: users[0]!,
    media: mediaItems[0]!,
    rating: 4.5,
    title: 'A blockbuster built like a memory',
    body: 'The scale is enormous, but what keeps landing is the emotional geometry: parents, children, and time folding around impossible choices.',
    hasSpoilers: false,
    likesCount: 184,
    commentsCount: 22,
    createdAt: '2026-05-12T18:30:00.000Z',
  },
  {
    id: 'rev_parasite',
    user: users[1]!,
    media: mediaItems[2]!,
    rating: 5,
    title: 'Pressure, precision, and no wasted frames',
    body: 'A social thriller that keeps changing shape without losing discipline. Every room, line, and silence is doing structural work.',
    hasSpoilers: false,
    likesCount: 231,
    commentsCount: 31,
    createdAt: '2026-05-10T11:15:00.000Z',
  },
  {
    id: 'rev_arcane',
    user: users[2]!,
    media: mediaItems[10]!,
    rating: 4.5,
    title: 'The rare adaptation with a real pulse',
    body: 'It understands that style only matters when it pressures character. The animation is gorgeous, but the emotional staging is the actual engine.',
    hasSpoilers: false,
    likesCount: 119,
    commentsCount: 14,
    createdAt: '2026-05-08T21:45:00.000Z',
  },
];

export const lists: CustomList[] = [
  {
    id: 'list_midnight',
    owner: users[1]!,
    title: 'Midnight Double Features',
    description: 'Two-title pairings for nights when the credits should feel dangerous.',
    isPrivate: false,
    items: [mediaItems[2]!, mediaItems[4]!, mediaItems[5]!, mediaItems[11]!],
    likesCount: 342,
    commentsCount: 28,
    updatedAt: '2026-05-17T08:00:00.000Z',
  },
  {
    id: 'list_space',
    owner: users[0]!,
    title: 'Big Feelings, Bigger Skies',
    description: 'Science fiction and fantasy where spectacle is tied to grief, wonder, or obsession.',
    isPrivate: false,
    items: [mediaItems[0]!, mediaItems[8]!, mediaItems[10]!, mediaItems[9]!],
    likesCount: 285,
    commentsCount: 19,
    updatedAt: '2026-05-15T14:00:00.000Z',
  },
];

export const activity: ActivityEvent[] = [
  {
    id: 'act_1',
    actor: users[0]!,
    verb: 'reviewed',
    media: mediaItems[0]!,
    review: reviews[0]!,
    createdAt: '2026-05-19T20:10:00.000Z',
  },
  {
    id: 'act_2',
    actor: users[1]!,
    verb: 'listed',
    list: lists[0]!,
    createdAt: '2026-05-19T18:05:00.000Z',
  },
  {
    id: 'act_3',
    actor: users[2]!,
    verb: 'favorited',
    media: mediaItems[10]!,
    createdAt: '2026-05-19T12:40:00.000Z',
  },
];

export function getMediaByType(mediaType: 'movie' | 'series') {
  return mediaItems.filter((item) => item.mediaType === mediaType);
}

export function getMediaDetail(mediaType: 'movie' | 'series', tmdbId: number) {
  return details.find((item) => item.mediaType === mediaType && item.tmdbId === tmdbId) ?? null;
}

export function searchAll(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return mediaItems.slice(0, 8);
  return mediaItems.filter((item) =>
    [item.title, item.overview, item.mediaType, ...item.genres].some((value) =>
      value.toLowerCase().includes(normalized),
    ),
  );
}
