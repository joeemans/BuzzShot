import { Injectable } from '@nestjs/common';
import { demoMedia, demoRecommendations } from '../demo-data.js';

@Injectable()
export class RecommendationsService {
  forYou() {
    return demoRecommendations;
  }

  scoreGenres(positiveGenres: string[], negativeGenres: string[] = []) {
    return demoMedia
      .map((media) => {
        const positive = media.genres.filter((genre) => positiveGenres.includes(genre)).length * 15;
        const negative = media.genres.filter((genre) => negativeGenres.includes(genre)).length * -12;
        return {
          media,
          score: Math.max(0, Math.min(100, Math.round(media.buzzScore * 8 + positive + negative))),
          reason: positive > 0 ? `Because you liked ${positiveGenres[0]}.` : 'Trending with BuzzShot members.',
        };
      })
      .sort((left, right) => right.score - left.score);
  }
}
