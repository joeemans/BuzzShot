import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { MediaModule } from '../media/media.module.js';
import { SearchController } from './search.controller.js';

@Module({
  imports: [DatabaseModule, MediaModule],
  controllers: [SearchController],
})
export class SearchModule {}
