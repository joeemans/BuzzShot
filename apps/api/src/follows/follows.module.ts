import { Module } from '@nestjs/common';
import { FollowsController } from './follows.controller.js';

@Module({
  controllers: [FollowsController],
})
export class FollowsModule {}
