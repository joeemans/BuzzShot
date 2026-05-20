import { Controller, Get } from '@nestjs/common';
import { envelope } from '../common/http.js';
import { demoActivity } from '../demo-data.js';

@Controller('feed')
export class FeedController {
  @Get()
  feed() {
    return envelope(demoActivity);
  }
}
