import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { envelope } from '../common/http.js';
import { demoReviews } from '../demo-data.js';

@Controller('reviews')
export class ReviewsController {
  @Get()
  list() {
    return envelope(demoReviews);
  }

  @Get(':reviewId')
  detail(@Param('reviewId') reviewId: string) {
    const review = demoReviews.find((item) => item.id === reviewId);
    if (!review) throw new NotFoundException('Review not found.');
    return envelope(review);
  }

  @Post()
  create(@Body() body: unknown) {
    return envelope({ accepted: true, review: body });
  }
}
