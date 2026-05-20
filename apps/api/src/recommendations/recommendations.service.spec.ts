import { describe, expect, it } from 'vitest';
import { RecommendationsService } from './recommendations.service.js';

describe('RecommendationsService', () => {
  it('boosts liked genres and preserves explanations', () => {
    const service = new RecommendationsService();
    const results = service.scoreGenres(['Drama'], ['Horror']);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.reason).toContain('Because');
  });
});
