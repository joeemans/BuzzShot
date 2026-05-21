import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { RedisModule } from '../database/redis.module.js';
import { TmdbController } from './tmdb.controller.js';
import { TmdbService } from './tmdb.service.js';

@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [TmdbController],
  providers: [TmdbService],
  exports: [TmdbService],
})
export class TmdbModule {}
