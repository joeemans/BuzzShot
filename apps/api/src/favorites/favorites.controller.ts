import { Body, Controller, Delete, Get, HttpCode, Post } from '@nestjs/common';
import { envelope } from '../common/http.js';
import { demoMedia } from '../demo-data.js';

@Controller('favorites')
export class FavoritesController {
  @Get()
  list() {
    return envelope(demoMedia.slice(2, 6));
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
