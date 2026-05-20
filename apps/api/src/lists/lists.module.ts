import { Module } from '@nestjs/common';
import { ListsController } from './lists.controller.js';

@Module({
  controllers: [ListsController],
})
export class ListsModule {}
