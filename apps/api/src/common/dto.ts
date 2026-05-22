import { Type } from 'class-transformer';
import {
  IsBoolean,
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import type { ApiMediaType } from './media.js';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number;
}

export class MediaTargetDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tmdbId!: number;

  @IsIn(['movie', 'series'])
  mediaType!: ApiMediaType;
}

export class RatingDto extends MediaTargetDto {
  @Type(() => Number)
  @Min(0.5)
  @Max(5)
  value!: number;
}

export class ReviewDto extends RatingDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string;

  @IsString()
  @MinLength(20)
  @MaxLength(4000)
  body!: string;

  @IsBoolean()
  hasSpoilers!: boolean;

  declare rating: number;
}

export class ReviewCreateDto extends MediaTargetDto {
  @Type(() => Number)
  @Min(0.5)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  body?: string;

  @IsBoolean()
  hasSpoilers!: boolean;
}

export class ReviewUpdateDto {
  @IsOptional()
  @Type(() => Number)
  @Min(0.5)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  body?: string;

  @IsOptional()
  @IsBoolean()
  hasSpoilers?: boolean;
}

export class CommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  body!: string;
}

export class ProfileUpdateDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  displayName!: string;

  @ValidateIf((value: ProfileUpdateDto) => value.bio !== null)
  @IsString()
  @MaxLength(280)
  bio!: string | null;

  @ValidateIf((value: ProfileUpdateDto) => value.location !== null)
  @IsString()
  @MaxLength(80)
  location!: string | null;

  @ValidateIf((value: ProfileUpdateDto) => value.avatarUrl !== null)
  @IsString()
  @MaxLength(90000)
  @Matches(/^(https:\/\/|data:image\/(?:png|jpeg|jpg|webp);base64,)/i, {
    message: 'Avatar must be an HTTPS image URL or a PNG, JPEG, or WebP data image.',
  })
  avatarUrl!: string | null;

  @IsString({ each: true })
  @IsArray()
  @ArrayMaxSize(8)
  @MaxLength(60, { each: true })
  favoriteGenres!: string[];
}

export class CustomListDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string;

  @IsString()
  @MaxLength(500)
  description!: string;

  @IsBoolean()
  isPrivate!: boolean;
}

export class CustomListItemDto extends MediaTargetDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position?: number;
}

export class ReorderListItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position!: number;
}

export class NotificationReadDto {
  @IsOptional()
  @IsString({ each: true })
  ids?: string[];
}

export class FollowDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(24)
  @Matches(/^[a-zA-Z0-9_]+$/)
  username?: string;
}

export class PasswordResetRequestDto {
  @IsEmail()
  email!: string;
}

export class PasswordResetConfirmDto {
  @IsString()
  @MinLength(24)
  token!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(128)
  @Matches(/[a-z]/, { message: 'Password needs a lowercase letter.' })
  @Matches(/[A-Z]/, { message: 'Password needs an uppercase letter.' })
  @Matches(/[0-9]/, { message: 'Password needs a number.' })
  password!: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  currentPassword!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(128)
  @Matches(/[a-z]/, { message: 'Password needs a lowercase letter.' })
  @Matches(/[A-Z]/, { message: 'Password needs an uppercase letter.' })
  @Matches(/[0-9]/, { message: 'Password needs a number.' })
  newPassword!: string;
}
