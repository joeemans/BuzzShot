import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { RatingsController } from './ratings.controller.js';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [RatingsController],
})
export class RatingsModule {}
