import { z } from 'zod';

export const mediaTypeSchema = z.enum(['movie', 'series']);

export const usernameSchema = z
  .string()
  .min(3)
  .max(24)
  .regex(/^[a-zA-Z0-9_]+$/, 'Use letters, numbers, and underscores only.');

export const passwordSchema = z
  .string()
  .min(10)
  .regex(/[a-z]/, 'Password needs a lowercase letter.')
  .regex(/[A-Z]/, 'Password needs an uppercase letter.')
  .regex(/[0-9]/, 'Password needs a number.');

export const registerSchema = z.object({
  email: z.string().email(),
  username: usernameSchema,
  displayName: z.string().min(2).max(80),
  password: passwordSchema,
});

export const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(1),
});

export const profileUpdateSchema = z.object({
  displayName: z.string().min(2).max(80),
  bio: z.string().max(280).nullable(),
  location: z.string().max(80).nullable(),
  avatarUrl: z
    .string()
    .max(90000)
    .regex(/^(https:\/\/|data:image\/(?:png|jpeg|jpg|webp);base64,)/i)
    .nullable(),
  favoriteGenres: z.array(z.string()).max(8),
});

export const ratingInputSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: mediaTypeSchema,
  value: z.number().min(0.5).max(5),
});

export const reviewInputSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: mediaTypeSchema,
  rating: z.number().min(0.5).max(5),
  title: z.string().max(120).optional(),
  body: z.string().max(4000).optional(),
  hasSpoilers: z.boolean(),
});

export const reviewCommentInputSchema = z.object({
  body: z.string().min(1).max(1000),
});

export const customListInputSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(500),
  isPrivate: z.boolean(),
});

export const customListItemInputSchema = z.object({
  tmdbId: z.number().int().positive(),
  mediaType: mediaTypeSchema,
  position: z.number().int().min(0).optional(),
});

export const customListCommentInputSchema = z.object({
  body: z.string().min(1).max(1000),
});

export const followInputSchema = z.object({
  userId: z.string().min(1).optional(),
  username: usernameSchema.optional(),
});

export const notificationReadSchema = z.object({
  ids: z.array(z.string().min(1)).max(100).optional(),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(24),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type RatingInput = z.infer<typeof ratingInputSchema>;
export type ReviewInput = z.infer<typeof reviewInputSchema>;
export type ReviewCommentInput = z.infer<typeof reviewCommentInputSchema>;
export type CustomListInput = z.infer<typeof customListInputSchema>;
export type CustomListItemInput = z.infer<typeof customListItemInputSchema>;
export type CustomListCommentInput = z.infer<typeof customListCommentInputSchema>;
export type FollowInput = z.infer<typeof followInputSchema>;
export type NotificationReadInput = z.infer<typeof notificationReadSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
