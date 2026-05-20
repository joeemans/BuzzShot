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
  cast: Array<{
    id: number;
    name: string;
    character: string;
    avatarUrl: string | null;
  }>;
  similar: MediaSummary[];
  recommendations: Array<{
    media: MediaSummary;
    score: number;
    reason: string;
  }>;
};

export type TmdbGenre = {
  id: number;
  name: string;
};

export type TmdbListResponse<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

export type TmdbMovie = {
  id: number;
  media_type?: 'movie';
  title?: string;
  original_title?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  genre_ids?: number[];
  genres?: TmdbGenre[];
  vote_average?: number;
  tagline?: string;
  runtime?: number | null;
  status?: string;
  videos?: { results?: TmdbVideo[] };
  credits?: { cast?: TmdbCastMember[] };
  similar?: TmdbListResponse<TmdbMovie>;
  recommendations?: TmdbListResponse<TmdbMovie>;
};

export type TmdbSeries = {
  id: number;
  media_type?: 'tv';
  name?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  first_air_date?: string;
  genre_ids?: number[];
  genres?: TmdbGenre[];
  vote_average?: number;
  tagline?: string;
  number_of_seasons?: number;
  status?: string;
  videos?: { results?: TmdbVideo[] };
  credits?: { cast?: TmdbCastMember[] };
  similar?: TmdbListResponse<TmdbSeries>;
  recommendations?: TmdbListResponse<TmdbSeries>;
};

export type TmdbSearchResult = (TmdbMovie | TmdbSeries) & {
  media_type?: 'movie' | 'tv' | 'person';
};

export type TmdbVideo = {
  key: string;
  site: string;
  type: string;
  official?: boolean;
};

export type TmdbCastMember = {
  id: number;
  name: string;
  character?: string;
  profile_path?: string | null;
};
