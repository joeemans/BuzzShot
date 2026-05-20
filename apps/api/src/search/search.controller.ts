import { Controller, Get, Inject, Query } from '@nestjs/common';
import { envelope } from '../common/http.js';
import { MediaService } from '../media/media.service.js';

@Controller('search')
export class SearchController {
  constructor(@Inject(MediaService) private readonly media: MediaService) {}

  @Get()
  async search(@Query('q') query = '') {
    return envelope(await this.media.search(query));
  }
}
