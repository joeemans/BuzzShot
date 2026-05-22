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
  crew: CrewMember[];
  producers: CrewMember[];
  imageUrls: string[];
  similar: MediaSummary[];
  recommendations: Recommendation[];
  buzz?: MediaBuzz;
  viewer?: MediaViewerState;
};

export type CastMember = {
  id: number;
  name: string;
  character: string;
  avatarUrl: string | null;
};

export type CrewMember = {
  id: number;
  name: string;
  job: string;
  avatarUrl: string | null;
};

export type PersonDetail = {
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
    watched: number;
    favorites: number;
    watchlist?: number;
  };
  viewer?: {
    isFollowing: boolean;
    canEdit: boolean;
  };
};

export type Rating = {
  id: string;
  user: UserSummary;
  tmdbId: number;
  mediaType: MediaType;
  value: number;
  createdAt: string;
  updatedAt?: string;
};

export type MediaBuzz = {
  averageRating: number | null;
  ratingsCount: number;
  reviewsCount: number;
};

export type MediaViewerState = {
  rating: number | null;
  inWatchlist: boolean;
  watched: boolean;
  favorite: boolean;
  lists?: MediaListMembership[];
};

export type MediaListMembership = {
  id: string;
  title: string;
  isPrivate: boolean;
  containsMedia: boolean;
  itemId: string | null;
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
  updatedAt?: string;
  likedByViewer?: boolean;
};

export type ReviewComment = {
  id: string;
  user: UserSummary;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomList = {
  id: string;
  owner: UserSummary;
  title: string;
  description: string;
  isPrivate: boolean;
  items: MediaSummary[];
  listItems?: CustomListItem[];
  likesCount: number;
  commentsCount: number;
  followersCount?: number;
  updatedAt: string;
  likedByViewer?: boolean;
  followedByViewer?: boolean;
  viewerCanEdit?: boolean;
};

export type CustomListItem = {
  id: string;
  media: MediaSummary;
  position: number;
  createdAt: string;
};

export type CustomListComment = {
  id: string;
  user: UserSummary;
  body: string;
  createdAt: string;
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

export type GroupedSearchResults = {
  media: MediaSummary[];
  users: UserSummary[];
  reviews: Review[];
  lists: CustomList[];
};

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string;
  readAt: string | null;
  createdAt: string;
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

export type CollectionKind = 'watchlist' | 'watched' | 'favorites';
