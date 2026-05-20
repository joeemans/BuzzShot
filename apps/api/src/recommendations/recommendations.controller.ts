import { Controller, Get, Inject } from '@nestjs/common';
import { envelope } from '../common/http.js';
import { RecommendationsService } from './recommendations.service.js';

@Controller('recommendations')
export class RecommendationsController {
  constructor(@Inject(RecommendationsService) private readonly recommendations: RecommendationsService) {}

  @Get('for-you')
  forYou() {
    return envelope(this.recommendations.forYou());
  }
}
