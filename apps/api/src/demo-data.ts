type MediaType = 'movie' | 'series';

type MediaSummary = {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  tagline?: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string | null;
  genres: string[];
  tmdbRating: number;
  buzzScore: number;
};

type MediaDetail = MediaSummary & {
  runtimeMinutes?: number;
  seasons?: number;
  status: string;
  trailerUrl: string | null;
  cast: Array<{ id: number; name: string; character: string; avatarUrl: string | null }>;
  crew: Array<{ id: number; name: string; job: string; avatarUrl: string | null }>;
  producers: Array<{ id: number; name: string; job: string; avatarUrl: string | null }>;
  imageUrls: string[];
  similar: MediaSummary[];
  recommendations: Recommendation[];
};

type PersonDetail = {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  knownForDepartment: string | null;
  profileUrl: string | null;
  homepage: string | null;
  imdbUrl: string | null;
  imageUrls: string[];
  knownFor: MediaSummary[];
};

type UserSummary = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
};

type Profile = UserSummary & {
  location: string | null;
  favoriteGenres: string[];
  stats: {
    reviews: number;
    ratings: number;
    followers: number;
    following: number;
    lists: number;
    watched: number;
    favorites: number;
    watchlist?: number;
  };
};

type Review = {
  id: string;
  user: UserSummary;
  media: MediaSummary;
  rating: number;
  title: string;
  body: string;
  hasSpoilers: boolean;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
};

type CustomList = {
  id: string;
  owner: UserSummary;
  title: string;
  description: string;
  isPrivate: boolean;
  items: MediaSummary[];
  likesCount: number;
  commentsCount: number;
  updatedAt: string;
};

type Recommendation = {
  media: MediaSummary;
  score: number;
  reason: string;
};

type ActivityEvent = {
  id: string;
  actor: UserSummary;
  verb: 'rated' | 'reviewed' | 'favorited' | 'watched' | 'listed' | 'followed';
  media?: MediaSummary;
  review?: Review;
  list?: CustomList;
  targetUser?: UserSummary;
  createdAt: string;
};

const poster = (path: string) => `https://image.tmdb.org/t/p/w500${path}`;
const backdrop = (path: string) => `https://image.tmdb.org/t/p/original${path}`;
const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}`;

export const demoUsers: UserSummary[] = [
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
    bio: 'Studio blockbusters, festival sleepers, and anything animated with nerve.',
  },
];

export const demoMedia: MediaSummary[] = [
  {
    tmdbId: 157336,
    mediaType: 'movie',
    title: 'Interstellar',
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    overview: 'Explorers travel through a wormhole to find humanity a future beyond Earth.',
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
    overview: 'Batman faces a criminal mastermind determined to push Gotham into chaos.',
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
      'A struggling family enters a wealthy household through deception and escalating class tension.',
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
    overview: 'A portrait of J. Robert Oppenheimer and the moral blast radius of the atomic bomb.',
    posterUrl: poster('/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg'),
    backdropUrl: backdrop('/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg'),
    releaseDate: '2023-07-19',
    genres: ['Drama', 'History'],
    tmdbRating: 8.1,
    buzzScore: 8.8,
  },
  {
    tmdbId: 1396,
    mediaType: 'series',
    title: 'Breaking Bad',
    overview: 'A chemistry teacher becomes a methamphetamine producer after a cancer diagnosis.',
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
    overview: 'A New Jersey mob boss navigates organized crime, therapy, and family pressure.',
    posterUrl: poster('/rTc7ZXdroqjkKivFPvCPX0Ru7uw.jpg'),
    backdropUrl: backdrop('/x4salpjB11umlUOltfNvSSrjSXm.jpg'),
    releaseDate: '1999-01-10',
    genres: ['Drama', 'Crime'],
    tmdbRating: 8.6,
    buzzScore: 9.5,
  },
  {
    tmdbId: 94605,
    mediaType: 'series',
    title: 'Arcane',
    overview:
      'Two sisters become central to a class war transformed by unstable magic and technology.',
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
    overview: 'A vigilante group takes on corrupt superheroes and the company that protects them.',
    posterUrl: poster('/stTEycfG9928HYGEISBFaG1ngjM.jpg'),
    backdropUrl: backdrop('/mGVrXeIjyecj6TKmwPVpHlscEmw.jpg'),
    releaseDate: '2019-07-25',
    genres: ['Action', 'Comedy', 'Drama'],
    tmdbRating: 8.5,
    buzzScore: 8.7,
  },
];

export const demoRecommendations: Recommendation[] = demoMedia.slice(0, 6).map((media, index) => ({
  media,
  score: 97 - index * 5,
  reason:
    index % 2 === 0
      ? `Because you liked ${media.genres[0]} titles with high community scores.`
      : `Popular with people who follow ${demoUsers[index % demoUsers.length]?.displayName ?? 'BuzzShot members'}.`,
}));

export const demoDetails: MediaDetail[] = demoMedia.map((media, index) => ({
  ...media,
  ...(media.mediaType === 'movie' ? { runtimeMinutes: 138 + index * 6 } : { seasons: 3 + index }),
  status: media.mediaType === 'movie' ? 'Released' : 'Returning Series',
  trailerUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${media.title} trailer`)}`,
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
  ],
  crew: [
    {
      id: index * 10 + 3,
      name: 'Lead Producer',
      job: 'Producer',
      avatarUrl: avatar(`${media.title} producer`),
    },
    {
      id: index * 10 + 4,
      name: 'Story Director',
      job: media.mediaType === 'movie' ? 'Director' : 'Creator',
      avatarUrl: avatar(`${media.title} director`),
    },
  ],
  producers: [
    {
      id: index * 10 + 3,
      name: 'Lead Producer',
      job: 'Producer',
      avatarUrl: avatar(`${media.title} producer`),
    },
  ],
  imageUrls: [media.backdropUrl].filter((url): url is string => Boolean(url)),
  similar: demoMedia
    .filter((item) => item.mediaType === media.mediaType && item.tmdbId !== media.tmdbId)
    .slice(0, 4),
  recommendations: demoRecommendations
    .filter((item) => item.media.tmdbId !== media.tmdbId)
    .slice(0, 3),
}));

export const demoPeople: PersonDetail[] = demoDetails.flatMap((detail) =>
  [...detail.cast, ...detail.crew].map((person) => ({
    id: person.id,
    name: person.name,
    biography: `${person.name} appears in BuzzShot demo credits for ${detail.title}. Configure TMDB credentials to load full biographies, credits, and images.`,
    birthday: null,
    deathday: null,
    placeOfBirth: null,
    knownForDepartment: 'Demo',
    profileUrl: person.avatarUrl,
    homepage: null,
    imdbUrl: null,
    imageUrls: person.avatarUrl ? [person.avatarUrl] : [],
    knownFor: [detail],
  })),
);

export const demoProfiles: Profile[] = demoUsers.map((user, index) => ({
  ...user,
  location: ['Cairo', 'Berlin', 'Toronto'][index] ?? 'Remote',
  favoriteGenres: [
    ['Drama', 'Crime'],
    ['Thriller', 'Mystery'],
    ['Animation', 'Science Fiction'],
  ][index] ?? ['Drama'],
  stats: {
    reviews: 21 + index * 8,
    ratings: 120 + index * 35,
    followers: 400 + index * 90,
    following: 140 + index * 30,
    lists: 5 + index,
    watched: 48 + index * 16,
    favorites: 12 + index * 5,
    watchlist: 18 + index * 4,
  },
}));

export const demoReviews: Review[] = [
  {
    id: 'rev_interstellar',
    user: demoUsers[0]!,
    media: demoMedia[0]!,
    rating: 4.5,
    title: 'A blockbuster built like a memory',
    body: 'The spectacle works because the emotional structure is so clear: parents, children, and time as pressure.',
    hasSpoilers: false,
    likesCount: 184,
    commentsCount: 22,
    createdAt: '2026-05-12T18:30:00.000Z',
  },
  {
    id: 'rev_parasite',
    user: demoUsers[1]!,
    media: demoMedia[2]!,
    rating: 5,
    title: 'Pressure, precision, and no wasted frames',
    body: 'A social thriller that keeps changing shape without losing discipline.',
    hasSpoilers: false,
    likesCount: 231,
    commentsCount: 31,
    createdAt: '2026-05-10T11:15:00.000Z',
  },
];

export const demoLists: CustomList[] = [
  {
    id: 'list_midnight',
    owner: demoUsers[1]!,
    title: 'Midnight Double Features',
    description: 'Two-title pairings for nights when the credits should feel dangerous.',
    isPrivate: false,
    items: [demoMedia[2]!, demoMedia[1]!, demoMedia[7]!],
    likesCount: 342,
    commentsCount: 28,
    updatedAt: '2026-05-17T08:00:00.000Z',
  },
  {
    id: 'list_space',
    owner: demoUsers[0]!,
    title: 'Big Feelings, Bigger Skies',
    description:
      'Science fiction and fantasy where spectacle is tied to grief, wonder, or obsession.',
    isPrivate: false,
    items: [demoMedia[0]!, demoMedia[6]!, demoMedia[4]!],
    likesCount: 285,
    commentsCount: 19,
    updatedAt: '2026-05-15T14:00:00.000Z',
  },
];

export const demoActivity: ActivityEvent[] = [
  {
    id: 'act_1',
    actor: demoUsers[0]!,
    verb: 'reviewed',
    media: demoMedia[0]!,
    review: demoReviews[0]!,
    createdAt: '2026-05-19T20:10:00.000Z',
  },
  {
    id: 'act_2',
    actor: demoUsers[1]!,
    verb: 'listed',
    list: demoLists[0]!,
    createdAt: '2026-05-19T18:05:00.000Z',
  },
];
