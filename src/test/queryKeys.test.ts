import { queryKeys, QUERY_PAGE_SIZE } from '../api/queryKeys';

describe('queryKeys', () => {
  it('centralizes infinite query keys with page sizes and no token values', () => {
    const token = 'dev-mobile-token';
    const channelsKey = queryKeys.channelsInfinite('https://api.example.com', 'monitored', 'react');
    const activityKey = queryKeys.activityInfinite('https://api.example.com', 'failed');

    expect(channelsKey).toEqual(['channels', 'https://api.example.com', 'monitored', 'react', QUERY_PAGE_SIZE.channels]);
    expect(activityKey).toEqual(['activity', 'https://api.example.com', 'failed', QUERY_PAGE_SIZE.activity]);
    expect(channelsKey).not.toContain(token);
    expect(activityKey).not.toContain(token);
  });

  it('provides stable predicates for invalidation', () => {
    expect(queryKeys.isChannels(queryKeys.channelsInfinite('https://api.example.com', 'all', ''))).toBe(true);
    expect(queryKeys.isChannels(queryKeys.activityInfinite('https://api.example.com', 'all'))).toBe(false);
    expect(queryKeys.isActivity(queryKeys.activityInfinite('https://api.example.com', 'all'))).toBe(true);
    expect(queryKeys.isActivity(queryKeys.status('https://api.example.com'))).toBe(false);
  });
});
