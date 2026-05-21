import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { MediaModule } from '../media/media.module.js';
import { WatchedController } from './watched.controller.js';

@Module({
  imports: [AuthModule, DatabaseModule, MediaModule],
  controllers: [WatchedController],
})
export class WatchedModule {}
