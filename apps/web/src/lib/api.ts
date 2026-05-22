import type {
  ActivityEvent,
  ApiEnvelope,
  CollectionKind,
  CustomList,
  CustomListComment,
  GroupedSearchResults,
  MediaDetail,
  MediaSummary,
  NotificationItem,
  Paginated,
  PersonDetail,
  Profile,
  Recommendation,
  Review,
} from '@buzzshot/shared';
import { cookies } from 'next/headers';
import {
  getMediaByType,
  getMediaDetail,
  getPersonDetail,
  getProfileCollection as getDemoProfileCollection,
  lists,
  mediaItems,
  profiles,
  reviews,
  searchAll,
} from './demo-data';

const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
const API_URL =
  typeof window === 'undefined' ? (process.env.INTERNAL_API_URL ?? PUBLIC_API_URL) : PUBLIC_API_URL;

type ApiRequestInit = RequestInit & {
  auth?: boolean;
  next?: {
    revalidate?: number | false;
  };
};

async function readApi<T>(path: string, fallback: T, init?: ApiRequestInit): Promise<T> {
  const { auth, headers, next, ...requestInit } = init ?? {};
  const cacheInit = requestInit.cache === 'no-store' ? {} : { next: next ?? { revalidate: 120 } };
  const cookieHeader = auth && typeof window === 'undefined' ? (await cookies()).toString() : '';

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...requestInit,
      ...cacheInit,
      headers: {
        Accept: 'application/json',
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
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
  return readApi<MediaSummary[]>(
    `/media/${mediaType === 'movie' ? 'movies' : 'series'}`,
    getMediaByType(mediaType),
  );
}

export function getDetail(mediaType: 'movie' | 'series', tmdbId: number) {
  return readApi<MediaDetail | null>(
    `/media/${mediaType}/${tmdbId}`,
    getMediaDetail(mediaType, tmdbId),
    { auth: true, cache: 'no-store' },
  );
}

export function getSearchResults(query: string) {
  return readApi<GroupedSearchResults>(
    `/search?q=${encodeURIComponent(query)}`,
    { media: searchAll(query), users: [], reviews: [], lists: [] },
    { cache: 'no-store' },
  );
}

export function getReviews(filters?: {
  tmdbId?: number;
  mediaType?: 'movie' | 'series';
  username?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.tmdbId && filters.mediaType) {
    params.set('tmdbId', String(filters.tmdbId));
    params.set('mediaType', filters.mediaType);
  }
  if (filters?.username) params.set('username', filters.username);
  const fallback = reviews.filter((review) => {
    if (filters?.tmdbId && filters.mediaType) {
      return review.media.tmdbId === filters.tmdbId && review.media.mediaType === filters.mediaType;
    }
    if (filters?.username) return review.user.username === filters.username;
    return true;
  });
  const query = params.toString();
  return readApi<Review[]>(`/reviews${query ? `?${query}` : ''}`, fallback, {
    auth: true,
    cache: 'no-store',
  });
}

export function getReview(reviewId: string) {
  return readApi<Review | null>(
    `/reviews/${reviewId}`,
    reviews.find((review) => review.id === reviewId) ?? null,
  );
}

export function getLists(username?: string) {
  const query = username ? `?username=${encodeURIComponent(username)}` : '';
  const fallback = username ? lists.filter((list) => list.owner.username === username) : lists;
  return readApi<CustomList[]>(`/lists${query}`, fallback, { auth: true, cache: 'no-store' });
}

export function getList(listId: string) {
  return readApi<CustomList | null>(
    `/lists/${listId}`,
    lists.find((list) => list.id === listId) ?? null,
    { auth: true, cache: 'no-store' },
  );
}

export function getListComments(listId: string) {
  return readApi<CustomListComment[]>(`/lists/${listId}/comments`, [], {
    auth: true,
    cache: 'no-store',
  });
}

export function getProfile(username: string) {
  return readApi<Profile | null>(
    `/profiles/${username}`,
    profiles.find((profile) => profile.username === username) ?? null,
    { auth: true, cache: 'no-store' },
  );
}

export function getProfileCollection(username: string, kind: CollectionKind) {
  return readApi<MediaSummary[]>(
    `/profiles/${username}/collections/${kind}`,
    getDemoProfileCollection(username, kind),
    { auth: true, cache: 'no-store' },
  );
}

export function getPerson(personId: number) {
  return readApi<PersonDetail | null>(`/media/person/${personId}`, getPersonDetail(personId), {
    cache: 'no-store',
  });
}

export function getFeed() {
  return readApi<Paginated<ActivityEvent>>(
    '/feed',
    { items: [], total: 0, page: 1, pageSize: 20 },
    { auth: true, cache: 'no-store' },
  );
}

export function getRecommendations() {
  return readApi<Recommendation[]>('/recommendations/for-you', [], {
    auth: true,
    cache: 'no-store',
  });
}

export function getCollection(kind: CollectionKind) {
  return readApi<MediaSummary[]>(`/${kind}`, [], { auth: true, cache: 'no-store' });
}

export function getNotifications() {
  return readApi<Paginated<NotificationItem>>(
    '/notifications',
    { items: [], total: 0, page: 1, pageSize: 20 },
    { auth: true, cache: 'no-store' },
  );
}
