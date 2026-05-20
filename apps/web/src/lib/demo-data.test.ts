import { describe, expect, it } from 'vitest';
import { getMediaDetail, getMediaByType, searchAll } from './demo-data';

describe('demo data', () => {
  it('returns media by type and searchable titles', () => {
    expect(getMediaByType('movie').length).toBeGreaterThan(0);
    expect(searchAll('interstellar')[0]?.title).toBe('Interstellar');
  });

  it('returns detail records with recommendations', () => {
    const detail = getMediaDetail('movie', 157336);
    expect(detail?.title).toBe('Interstellar');
    expect(detail?.recommendations.length).toBeGreaterThan(0);
  });
});
