import { MediaType as PrismaMediaType } from '@prisma/client';
import type { ActivityVerb } from '@prisma/client';

export type ApiMediaType = 'movie' | 'series';

export function toPrismaMediaType(mediaType: ApiMediaType) {
  return mediaType === 'movie' ? PrismaMediaType.MOVIE : PrismaMediaType.SERIES;
}

export function toApiMediaType(mediaType: PrismaMediaType): ApiMediaType {
  return mediaType === PrismaMediaType.MOVIE ? 'movie' : 'series';
}

export function toApiVerb(verb: ActivityVerb) {
  return verb.toLowerCase() as 'rated' | 'reviewed' | 'favorited' | 'watched' | 'listed' | 'followed';
}
