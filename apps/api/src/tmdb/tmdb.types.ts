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
  crew: Array<{
    id: number;
    name: string;
    job: string;
    avatarUrl: string | null;
  }>;
  producers: Array<{
    id: number;
    name: string;
    job: string;
    avatarUrl: string | null;
  }>;
  imageUrls: string[];
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
  credits?: { cast?: TmdbCastMember[]; crew?: TmdbCrewMember[] };
  images?: TmdbImages;
  similar?: TmdbListResponse<TmdbMovie>;
  recommendations?: TmdbListResponse<TmdbMovie>;
  popularity?: number;
  vote_count?: number;
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
  credits?: { cast?: TmdbCastMember[]; crew?: TmdbCrewMember[] };
  created_by?: TmdbCreatedBy[];
  images?: TmdbImages;
  similar?: TmdbListResponse<TmdbSeries>;
  recommendations?: TmdbListResponse<TmdbSeries>;
  popularity?: number;
  vote_count?: number;
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
  order?: number;
};

export type TmdbCrewMember = {
  id: number;
  name: string;
  job?: string;
  department?: string;
  profile_path?: string | null;
};

export type TmdbCreatedBy = {
  id: number;
  name: string;
  profile_path?: string | null;
};

export type TmdbImage = {
  file_path: string;
  width?: number;
  height?: number;
  aspect_ratio?: number;
};

export type TmdbImages = {
  backdrops?: TmdbImage[];
  posters?: TmdbImage[];
  profiles?: TmdbImage[];
};

export type TmdbExternalIds = {
  imdb_id?: string | null;
  instagram_id?: string | null;
  twitter_id?: string | null;
};

export type TmdbCreditMedia = (TmdbMovie | TmdbSeries) & {
  media_type?: 'movie' | 'tv';
  character?: string;
  job?: string;
};

export type TmdbPerson = {
  id: number;
  name: string;
  biography?: string;
  birthday?: string | null;
  deathday?: string | null;
  place_of_birth?: string | null;
  known_for_department?: string | null;
  profile_path?: string | null;
  homepage?: string | null;
  external_ids?: TmdbExternalIds;
  images?: TmdbImages;
  combined_credits?: {
    cast?: TmdbCreditMedia[];
    crew?: TmdbCreditMedia[];
  };
};
