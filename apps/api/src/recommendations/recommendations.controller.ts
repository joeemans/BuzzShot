import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ApiAuthGuard } from '../auth/api-auth.guard.js';
import { CurrentUser, type RequestUser } from '../auth/current-user.decorator.js';
import { envelope } from '../common/http.js';
import { RecommendationsService } from './recommendations.service.js';

@UseGuards(ApiAuthGuard)
@Controller('recommendations')
export class RecommendationsController {
  constructor(@Inject(RecommendationsService) private readonly recommendations: RecommendationsService) {}

  @Get('for-you')
  async forYou(@CurrentUser() user: RequestUser) {
    return envelope(await this.recommendations.forYou(user.id));
  }
}
