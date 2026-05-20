import { Body, Controller, Delete, HttpCode, Post } from '@nestjs/common';
import { envelope } from '../common/http.js';

@Controller('ratings')
export class RatingsController {
  @Post()
  upsert(@Body() body: unknown) {
    return envelope({ accepted: true, rating: body });
  }

  @HttpCode(204)
  @Delete()
  remove() {
    return;
  }
}
