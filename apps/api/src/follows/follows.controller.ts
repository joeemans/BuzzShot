import { Body, Controller, Delete, HttpCode, Post } from '@nestjs/common';
import { envelope } from '../common/http.js';

@Controller('follows')
export class FollowsController {
  @Post()
  follow(@Body() body: unknown) {
    return envelope({ accepted: true, follow: body });
  }

  @HttpCode(204)
  @Delete()
  unfollow() {
    return;
  }
}
