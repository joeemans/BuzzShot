import { Module } from '@nestjs/common';
import { RatingsController } from './ratings.controller.js';

@Module({
  controllers: [RatingsController],
})
export class RatingsModule {}
