import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { MediaModule } from '../media/media.module.js';
import { FeedController } from './feed.controller.js';

@Module({
  imports: [AuthModule, DatabaseModule, MediaModule],
  controllers: [FeedController],
})
export class FeedModule {}
