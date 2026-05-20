import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module.js';
import { SearchController } from './search.controller.js';

@Module({
  imports: [MediaModule],
  controllers: [SearchController],
})
export class SearchModule {}
