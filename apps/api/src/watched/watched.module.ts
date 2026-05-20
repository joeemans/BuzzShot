import { Module } from '@nestjs/common';
import { WatchedController } from './watched.controller.js';

@Module({
  controllers: [WatchedController],
})
export class WatchedModule {}
