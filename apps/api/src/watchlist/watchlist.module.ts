import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { MediaModule } from '../media/media.module.js';
import { WatchlistController } from './watchlist.controller.js';

@Module({
  imports: [AuthModule, DatabaseModule, MediaModule],
  controllers: [WatchlistController],
})
export class WatchlistModule {}
