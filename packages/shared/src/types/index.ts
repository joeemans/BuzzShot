export type MediaType = 'movie' | 'series';

export type MediaSummary = {
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

export type MediaDetail = MediaSummary & {
  runtimeMinutes?: number;
  seasons?: number;
  status: string;
  trailerUrl: string | null;
  cast: CastMember[];
  similar: MediaSummary[];
  recommendations: Recommendation[];
};

export type CastMember = {
  id: number;
  name: string;
  character: string;
  avatarUrl: string | null;
};

export type UserSummary = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
};

export type Profile = UserSummary & {
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

export type Rating = {
  id: string;
  user: UserSummary;
  tmdbId: number;
  mediaType: MediaType;
  value: number;
  createdAt: string;
};

export type Review = {
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

export type CustomList = {
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

export type ActivityEvent = {
  id: string;
  actor: UserSummary;
  verb: 'rated' | 'reviewed' | 'favorited' | 'watched' | 'listed' | 'followed';
  media?: MediaSummary;
  review?: Review;
  list?: CustomList;
  targetUser?: UserSummary;
  createdAt: string;
};

export type Recommendation = {
  media: MediaSummary;
  score: number;
  reason: string;
};

export type AuthUser = UserSummary & {
  email: string;
};

export type ApiEnvelope<T> = {
  data: T;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
