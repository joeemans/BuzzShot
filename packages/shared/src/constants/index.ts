export const APP_NAME = 'BuzzShot';
export const API_PREFIX = '/api';

export const MEDIA_GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Science Fiction',
  'Thriller',
] as const;

export const COLLECTION_KINDS = ['watchlist', 'watched', 'favorites'] as const;

export const TMDB_CACHE_TTLS_SECONDS = {
  trending: 60 * 60 * 6,
  search: 60 * 60 * 24,
  details: 60 * 60 * 24 * 7,
  credits: 60 * 60 * 24 * 14,
  genres: 60 * 60 * 24 * 30,
  related: 60 * 60 * 24 * 7,
} as const;
