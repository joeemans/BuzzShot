import { Body, Controller, Delete, Get, HttpCode, Post } from '@nestjs/common';
import { envelope } from '../common/http.js';
import { demoRecommendations } from '../demo-data.js';

@Controller('watchlist')
export class WatchlistController {
  @Get()
  list() {
    return envelope(demoRecommendations.map((item) => item.media));
  }

  @Post()
  add(@Body() body: unknown) {
    return envelope({ accepted: true, item: body });
  }

  @HttpCode(204)
  @Delete()
  remove() {
    return;
  }
}
