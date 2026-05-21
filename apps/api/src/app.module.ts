import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { DatabaseModule } from './database/database.module.js';
import { RedisModule } from './database/redis.module.js';
import { FavoritesModule } from './favorites/favorites.module.js';
import { FeedModule } from './feed/feed.module.js';
import { FollowsModule } from './follows/follows.module.js';
import { HealthModule } from './health/health.module.js';
import { ListsModule } from './lists/lists.module.js';
import { MediaModule } from './media/media.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { ProfilesModule } from './profiles/profiles.module.js';
import { RatingsModule } from './ratings/ratings.module.js';
import { RecommendationsModule } from './recommendations/recommendations.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { SearchModule } from './search/search.module.js';
import { TmdbModule } from './tmdb/tmdb.module.js';
import { UsersModule } from './users/users.module.js';
import { WatchedModule } from './watched/watched.module.js';
import { WatchlistModule } from './watchlist/watchlist.module.js';
import { validateEnv } from './config/env.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env.local', '../../.env', '.env.local', '.env'],
      validate: validateEnv,
    }),
    DatabaseModule,
    RedisModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    MediaModule,
    TmdbModule,
    SearchModule,
    RatingsModule,
    ReviewsModule,
    WatchlistModule,
    WatchedModule,
    FavoritesModule,
    ListsModule,
    FollowsModule,
    FeedModule,
    NotificationsModule,
    RecommendationsModule,
    HealthModule,
  ],
})
export class AppModule {}
