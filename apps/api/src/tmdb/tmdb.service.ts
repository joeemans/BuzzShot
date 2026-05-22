import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaType as PrismaMediaType, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service.js';
import { RedisService } from '../database/redis.service.js';
import type { Env } from '../config/env.js';
import type {
  MediaDetail,
  MediaSummary,
  MediaType,
  TmdbCastMember,
  TmdbCreditMedia,
  TmdbCrewMember,
  TmdbGenre,
  TmdbImage,
  TmdbListResponse,
  TmdbMovie,
  TmdbPerson,
  TmdbSearchResult,
  TmdbSeries,
  TmdbVideo,
} from './tmdb.types.js';

type TmdbConfiguration = {
  images?: {
    secure_base_url?: string;
    poster_sizes?: string[];
    backdrop_sizes?: string[];
    profile_sizes?: string[];
  };
};

const fallbackGenres = new Map<number, string>([
  [28, 'Action'],
  [12, 'Adventure'],
  [16, 'Animation'],
  [35, 'Comedy'],
  [80, 'Crime'],
  [18, 'Drama'],
  [14, 'Fantasy'],
  [27, 'Horror'],
  [9648, 'Mystery'],
  [10749, 'Romance'],
  [878, 'Science Fiction'],
  [53, 'Thriller'],
]);

const cacheTtls = {
  trending: 60 * 60 * 6,
  search: 60 * 60 * 24,
  details: 60 * 60 * 24 * 7,
  people: 60 * 60 * 24 * 14,
  genres: 60 * 60 * 24 * 30,
};

@Injectable()
export class TmdbService {
  private readonly apiBaseUrl: string;
  private readonly imageBaseUrl: string;
  private genreMap = fallbackGenres;

  constructor(
    @Inject(ConfigService)
    private readonly config: ConfigService<Env, true>,
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(RedisService)
    private readonly redis: RedisService,
  ) {
    this.apiBaseUrl = this.config.get('TMDB_API_BASE_URL', { infer: true });
    this.imageBaseUrl = this.config.get('TMDB_IMAGE_BASE_URL', { infer: true });
  }

  async configuration() {
    return this.cached(
      'tmdb:configuration',
      cacheTtls.genres,
      () => this.request<TmdbConfiguration>('/configuration'),
      this.cacheRecord(0, PrismaMediaType.MOVIE, 'configuration'),
    );
  }

  async genres() {
    const [movieGenres, seriesGenres] = await Promise.all([
      this.cached(
        'tmdb:genres:movie',
        cacheTtls.genres,
        () => this.request<{ genres: TmdbGenre[] }>('/genre/movie/list'),
        this.cacheRecord(0, PrismaMediaType.MOVIE, 'genres:movie'),
      ),
      this.cached(
        'tmdb:genres:series',
        cacheTtls.genres,
        () => this.request<{ genres: TmdbGenre[] }>('/genre/tv/list'),
        this.cacheRecord(0, PrismaMediaType.SERIES, 'genres:series'),
      ),
    ]);
    this.genreMap = new Map(
      [...movieGenres.genres, ...seriesGenres.genres].map((genre) => [genre.id, genre.name]),
    );
    return [
      ...new Set([...movieGenres.genres, ...seriesGenres.genres].map((genre) => genre.name)),
    ].sort();
  }

  async trending() {
    const response = await this.cached(
      'tmdb:trending:all:week',
      cacheTtls.trending,
      () => this.request<TmdbListResponse<TmdbSearchResult>>('/trending/all/week'),
      this.cacheRecord(0, PrismaMediaType.MOVIE, 'trending:all:week'),
    );
    return response.results
      .map((item) => this.normalizeSearchResult(item))
      .filter((item): item is MediaSummary => item !== null)
      .slice(0, 20);
  }

  async list(
    mediaType: MediaType,
    list: 'popular' | 'top-rated' | 'now-playing' | 'upcoming' | 'airing-today',
    page = 1,
  ) {
    const safePage = Math.max(1, Math.min(500, Math.trunc(page)));
    const endpoint = this.listEndpoint(mediaType, list);
    const cacheKey = `tmdb:list:${mediaType}:${list}:${safePage}`;
    const response = await this.cached(
      cacheKey,
      cacheTtls.trending,
      () => this.request<TmdbListResponse<TmdbMovie | TmdbSeries>>(endpoint, { page: safePage }),
      this.cacheRecord(0, this.prismaMediaType(mediaType), `list:${mediaType}:${list}:${safePage}`),
    );
    return response.results.map((item) => this.normalizeSummary(item, mediaType)).slice(0, 20);
  }

  async listPage(
    mediaType: MediaType,
    list: 'popular' | 'top-rated' | 'now-playing' | 'upcoming' | 'airing-today',
    page = 1,
  ) {
    const safePage = Math.max(1, Math.min(500, Math.trunc(page)));
    const endpoint = this.listEndpoint(mediaType, list);
    const cacheKey = `tmdb:list-page:${mediaType}:${list}:${safePage}`;
    const response = await this.cached(
      cacheKey,
      cacheTtls.trending,
      () => this.request<TmdbListResponse<TmdbMovie | TmdbSeries>>(endpoint, { page: safePage }),
      this.cacheRecord(
        0,
        this.prismaMediaType(mediaType),
        `list-page:${mediaType}:${list}:${safePage}`,
      ),
    );
    const pageSize = 20;
    return {
      items: response.results
        .map((item) => this.normalizeSummary(item, mediaType))
        .slice(0, pageSize),
      total: Math.min(response.total_results, response.total_pages * pageSize),
      page: response.page,
      pageSize,
    };
  }

  async search(query: string) {
    if (!query.trim()) return this.trending();
    const normalized = query.trim().toLowerCase();
    const response = await this.cached(
      `tmdb:search:${normalized}`,
      cacheTtls.search,
      () =>
        this.request<TmdbListResponse<TmdbSearchResult>>('/search/multi', {
          query,
          include_adult: 'false',
        }),
      this.cacheRecord(0, PrismaMediaType.MOVIE, `search:${normalized}`),
    );
    return response.results
      .map((item) => this.normalizeSearchResult(item))
      .filter((item): item is MediaSummary => item !== null)
      .slice(0, 20);
  }

  async detail(mediaType: MediaType, tmdbId: number) {
    const namespace = mediaType === 'movie' ? 'movie' : 'tv';
    const response = await this.cached(
      `tmdb:detail:${mediaType}:${tmdbId}`,
      cacheTtls.details,
      () =>
        this.request<TmdbMovie | TmdbSeries>(`/${namespace}/${tmdbId}`, {
          append_to_response: 'credits,videos,images,similar,recommendations',
          include_image_language: 'en,null',
        }),
      this.cacheRecord(tmdbId, this.prismaMediaType(mediaType), 'details'),
    );
    return this.normalizeDetail(response, mediaType);
  }

  async person(personId: number) {
    const response = await this.cached(`tmdb:person:${personId}`, cacheTtls.people, () =>
      this.request<TmdbPerson>(`/person/${personId}`, {
        append_to_response: 'combined_credits,external_ids,images',
        include_image_language: 'en,null',
      }),
    );
    return this.normalizePerson(response);
  }

  private listEndpoint(
    mediaType: MediaType,
    list: 'popular' | 'top-rated' | 'now-playing' | 'upcoming' | 'airing-today',
  ) {
    if (mediaType === 'movie') {
      if (list === 'top-rated') return '/movie/top_rated';
      if (list === 'now-playing') return '/movie/now_playing';
      if (list === 'upcoming') return '/movie/upcoming';
      return '/movie/popular';
    }
    if (list === 'top-rated') return '/tv/top_rated';
    if (list === 'airing-today') return '/tv/airing_today';
    return '/tv/popular';
  }

  private async cached<T>(
    key: string,
    ttlSeconds: number,
    load: () => Promise<T>,
    recordKey?: { tmdbId: number; mediaType: PrismaMediaType; scope: string },
  ) {
    const cached = await this.redis.getJson<T>(key);
    if (cached) return cached;

    const dbCached = recordKey
      ? await this.prisma.mediaCache.findUnique({
          where: {
            tmdbId_mediaType_scope: recordKey,
          },
        })
      : null;

    if (dbCached && dbCached.staleAt > new Date()) {
      const payload = dbCached.payload as T;
      await this.redis.setJson(key, payload, ttlSeconds);
      return payload;
    }

    try {
      const value = await load();
      await this.redis.setJson(key, value, ttlSeconds);
      if (recordKey) {
        await this.prisma.mediaCache.upsert({
          where: { tmdbId_mediaType_scope: recordKey },
          update: {
            payload: value as Prisma.InputJsonValue,
            staleAt: new Date(Date.now() + ttlSeconds * 1000),
          },
          create: {
            ...recordKey,
            payload: value as Prisma.InputJsonValue,
            staleAt: new Date(Date.now() + ttlSeconds * 1000),
          },
        });
      }
      return value;
    } catch (error) {
      if (dbCached) {
        const payload = dbCached.payload as T;
        await this.redis.setJson(key, payload, Math.min(ttlSeconds, 60 * 15));
        return payload;
      }
      throw error;
    }
  }

  private cacheRecord(tmdbId: number, mediaType: PrismaMediaType, scope: string) {
    return { tmdbId, mediaType, scope };
  }

  private prismaMediaType(mediaType: MediaType) {
    return mediaType === 'movie' ? PrismaMediaType.MOVIE : PrismaMediaType.SERIES;
  }

  private async request<T>(path: string, query: Record<string, string | number | boolean> = {}) {
    const token = this.config.get('TMDB_READ_ACCESS_TOKEN', { infer: true });
    const apiKey = this.config.get('TMDB_API_KEY', { infer: true });
    if (!token && !apiKey) {
      throw new ServiceUnavailableException('TMDB credentials are not configured.');
    }

    const url = new URL(`${this.apiBaseUrl}${path}`);
    url.searchParams.set('language', 'en-US');
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, String(value));
    }
    if (!token && apiKey) {
      url.searchParams.set('api_key', apiKey);
    }

    const response = await fetch(url, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          }
        : {
            Accept: 'application/json',
          },
    });

    if (!response.ok) {
      throw new ServiceUnavailableException(`TMDB request failed with ${response.status}.`);
    }
    return (await response.json()) as T;
  }

  private normalizeSearchResult(item: TmdbSearchResult) {
    if (item.media_type === 'movie') return this.normalizeSummary(item, 'movie');
    if (item.media_type === 'tv') return this.normalizeSummary(item, 'series');
    return null;
  }

  private normalizeSummary(item: TmdbMovie | TmdbSeries, mediaType: MediaType): MediaSummary {
    const isMovie = mediaType === 'movie';
    const title = isMovie
      ? ((item as TmdbMovie).title ?? (item as TmdbMovie).original_title ?? 'Untitled Movie')
      : ((item as TmdbSeries).name ?? (item as TmdbSeries).original_name ?? 'Untitled Series');
    const releaseDate = isMovie
      ? ((item as TmdbMovie).release_date ?? null)
      : ((item as TmdbSeries).first_air_date ?? null);
    const genres =
      item.genres?.map((genre) => genre.name) ??
      item.genre_ids
        ?.map((id) => this.genreMap.get(id))
        .filter((genre): genre is string => Boolean(genre)) ??
      [];
    const tmdbRating = Number((item.vote_average ?? 0).toFixed(1));

    return {
      tmdbId: item.id,
      mediaType,
      title,
      overview: item.overview ?? '',
      posterUrl: this.imageUrl(item.poster_path, 'w500'),
      backdropUrl: this.imageUrl(item.backdrop_path, 'original'),
      releaseDate,
      genres,
      tmdbRating,
      buzzScore: this.toBuzzScore(tmdbRating),
      ...(item.tagline ? { tagline: item.tagline } : {}),
    };
  }

  private normalizeDetail(item: TmdbMovie | TmdbSeries, mediaType: MediaType): MediaDetail {
    const summary = this.normalizeSummary(item, mediaType);
    const isMovie = mediaType === 'movie';
    const video = this.pickTrailer(item.videos?.results ?? []);
    const similar =
      item.similar?.results?.map((entry) => this.normalizeSummary(entry, mediaType)).slice(0, 8) ??
      [];
    const recommendations =
      item.recommendations?.results
        ?.map((entry, index) => ({
          media: this.normalizeSummary(entry, mediaType),
          score: Math.max(60, 96 - index * 3),
          reason: `Because TMDB recommends it for ${summary.title}.`,
        }))
        .slice(0, 8) ?? [];

    const runtime = (item as TmdbMovie).runtime;
    const seasons = (item as TmdbSeries).number_of_seasons;
    const crew = this.normalizeCrew(item, mediaType);
    const producers = this.normalizeProducers(item, mediaType);

    return {
      ...summary,
      ...(isMovie && runtime != null ? { runtimeMinutes: runtime } : {}),
      ...(!isMovie && seasons != null ? { seasons } : {}),
      status: item.status ?? 'Unknown',
      trailerUrl: video ? `https://www.youtube.com/watch?v=${video.key}` : null,
      cast: (item.credits?.cast ?? []).slice(0, 12).map((member) => this.normalizeCast(member)),
      crew,
      producers,
      imageUrls: this.normalizeImages(item.images?.backdrops, 'original', 10),
      similar,
      recommendations,
    };
  }

  private normalizeCast(member: TmdbCastMember) {
    return {
      id: member.id,
      name: member.name,
      character: member.character ?? '',
      avatarUrl: this.imageUrl(member.profile_path, 'w185'),
    };
  }

  private normalizeCrew(item: TmdbMovie | TmdbSeries, mediaType: MediaType) {
    const priority = new Set(
      mediaType === 'movie'
        ? ['Director', 'Screenplay', 'Writer', 'Story']
        : ['Creator', 'Executive Producer', 'Producer', 'Showrunner', 'Writer'],
    );
    const createdBy =
      mediaType === 'series'
        ? ((item as TmdbSeries).created_by ?? []).map((creator) => ({
            id: creator.id,
            name: creator.name,
            job: 'Creator',
            avatarUrl: this.imageUrl(creator.profile_path, 'w185'),
          }))
        : [];
    const credited = (item.credits?.crew ?? [])
      .filter((member) => member.job && priority.has(member.job))
      .map((member) => this.normalizeCrewMember(member));
    return this.uniquePeople([...createdBy, ...credited]).slice(0, 12);
  }

  private normalizeProducers(item: TmdbMovie | TmdbSeries, mediaType: MediaType) {
    const producerJobs = new Set(['Producer', 'Executive Producer']);
    const crew = (item.credits?.crew ?? [])
      .filter((member) => member.job && producerJobs.has(member.job))
      .map((member) => this.normalizeCrewMember(member));
    const createdBy =
      mediaType === 'series'
        ? ((item as TmdbSeries).created_by ?? []).map((creator) => ({
            id: creator.id,
            name: creator.name,
            job: 'Creator',
            avatarUrl: this.imageUrl(creator.profile_path, 'w185'),
          }))
        : [];
    return this.uniquePeople([...createdBy, ...crew]).slice(0, 12);
  }

  private normalizeCrewMember(member: TmdbCrewMember) {
    return {
      id: member.id,
      name: member.name,
      job: member.job ?? member.department ?? 'Crew',
      avatarUrl: this.imageUrl(member.profile_path, 'w185'),
    };
  }

  private uniquePeople<T extends { id: number }>(people: T[]) {
    const seen = new Set<number>();
    return people.filter((person) => {
      if (seen.has(person.id)) return false;
      seen.add(person.id);
      return true;
    });
  }

  private normalizePerson(person: TmdbPerson) {
    const credits = [
      ...(person.combined_credits?.cast ?? []),
      ...(person.combined_credits?.crew ?? []),
    ];
    const knownFor = this.uniqueCreditMedia(credits)
      .sort((left, right) => this.creditScore(right) - this.creditScore(left))
      .map((credit) => {
        const mediaType = credit.media_type === 'tv' ? 'series' : 'movie';
        return this.normalizeSummary(credit, mediaType);
      })
      .slice(0, 16);
    const imdbId = person.external_ids?.imdb_id;

    return {
      id: person.id,
      name: person.name,
      biography: person.biography ?? '',
      birthday: person.birthday ?? null,
      deathday: person.deathday ?? null,
      placeOfBirth: person.place_of_birth ?? null,
      knownForDepartment: person.known_for_department ?? null,
      profileUrl: this.imageUrl(person.profile_path, 'w500'),
      homepage: person.homepage ?? null,
      imdbUrl: imdbId ? `https://www.imdb.com/name/${imdbId}/` : null,
      imageUrls: this.normalizeImages(person.images?.profiles, 'w500', 8),
      knownFor,
    };
  }

  private uniqueCreditMedia(credits: TmdbCreditMedia[]) {
    const seen = new Set<string>();
    return credits.filter((credit) => {
      if (credit.media_type !== 'movie' && credit.media_type !== 'tv') return false;
      const key = `${credit.media_type}:${credit.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private creditScore(credit: TmdbCreditMedia) {
    return (
      (credit.vote_count ?? 0) + (credit.popularity ?? 0) * 10 + (credit.vote_average ?? 0) * 5
    );
  }

  private normalizeImages(
    images: TmdbImage[] | undefined,
    size: 'w500' | 'original',
    limit: number,
  ) {
    return (
      images
        ?.map((image) => this.imageUrl(image.file_path, size))
        .filter((url): url is string => Boolean(url))
        .slice(0, limit) ?? []
    );
  }

  private pickTrailer(videos: TmdbVideo[]) {
    return (
      videos.find(
        (video) => video.site === 'YouTube' && video.type === 'Trailer' && video.official,
      ) ??
      videos.find((video) => video.site === 'YouTube' && video.type === 'Trailer') ??
      videos.find((video) => video.site === 'YouTube')
    );
  }

  private imageUrl(path: string | null | undefined, size: 'w185' | 'w500' | 'original') {
    return path ? `${this.imageBaseUrl}/${size}${path}` : null;
  }

  private toBuzzScore(tmdbRating: number) {
    return Number(Math.min(10, Math.max(0, tmdbRating + 0.4)).toFixed(1));
  }
}
