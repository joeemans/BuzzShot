import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { FollowsController } from './follows.controller.js';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [FollowsController],
})
export class FollowsModule {}
