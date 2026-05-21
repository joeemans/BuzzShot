import type {
  ActivityEvent,
  ApiEnvelope,
  CustomList,
  MediaDetail,
  MediaSummary,
  Profile,
  Recommendation,
  Review,
} from '@buzzshot/shared';
import {
  activity,
  getMediaByType,
  getMediaDetail,
  lists,
  mediaItems,
  profiles,
  recommendations,
  reviews,
  searchAll,
} from './demo-data';

const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
const API_URL =
  typeof window === 'undefined' ? (process.env.INTERNAL_API_URL ?? PUBLIC_API_URL) : PUBLIC_API_URL;

type ApiRequestInit = RequestInit & {
  next?: {
    revalidate?: number | false;
  };
};

async function readApi<T>(path: string, fallback: T, init?: ApiRequestInit): Promise<T> {
  const { headers, next, ...requestInit } = init ?? {};
  const cacheInit = requestInit.cache === 'no-store' ? {} : { next: next ?? { revalidate: 120 } };

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...requestInit,
      ...cacheInit,
      headers: {
        Accept: 'application/json',
        ...headers,
      },
    });
    if (!response.ok) return fallback;
    const payload = (await response.json()) as ApiEnvelope<T> | T;
    return typeof payload === 'object' && payload !== null && 'data' in payload
      ? (payload as ApiEnvelope<T>).data
      : (payload as T);
  } catch {
    return fallback;
  }
}

export function getTrending() {
  return readApi<MediaSummary[]>('/media/trending', mediaItems.slice(0, 10));
}

export function getCatalog(mediaType: 'movie' | 'series') {
  return readApi<MediaSummary[]>(`/media/${mediaType === 'movie' ? 'movies' : 'series'}`, getMediaByType(mediaType));
}

export function getDetail(mediaType: 'movie' | 'series', tmdbId: number) {
  return readApi<MediaDetail | null>(
    `/media/${mediaType}/${tmdbId}`,
    getMediaDetail(mediaType, tmdbId),
  );
}

export function getSearchResults(query: string) {
  return readApi<MediaSummary[]>(`/search?q=${encodeURIComponent(query)}`, searchAll(query));
}

export function getReviews() {
  return readApi<Review[]>('/reviews', reviews);
}

export function getReview(reviewId: string) {
  return readApi<Review | null>(
    `/reviews/${reviewId}`,
    reviews.find((review) => review.id === reviewId) ?? null,
  );
}

export function getLists() {
  return readApi<CustomList[]>('/lists', lists);
}

export function getList(listId: string) {
  return readApi<CustomList | null>(
    `/lists/${listId}`,
    lists.find((list) => list.id === listId) ?? null,
  );
}

export function getProfile(username: string) {
  return readApi<Profile | null>(
    `/profiles/${username}`,
    profiles.find((profile) => profile.username === username) ?? null,
    { cache: 'no-store' },
  );
}

export function getFeed() {
  return readApi<ActivityEvent[]>('/feed', activity);
}

export function getRecommendations() {
  return readApi<Recommendation[]>('/recommendations/for-you', recommendations);
}
