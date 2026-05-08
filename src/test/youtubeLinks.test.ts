import { isAllowedYouTubeUrl } from '../components/activity/youtubeLinks';

describe('youtube link allowlist', () => {
  it('allows trusted HTTPS YouTube hosts', () => {
    expect(isAllowedYouTubeUrl('https://youtube.com/watch?v=abc')).toBe(true);
    expect(isAllowedYouTubeUrl('https://www.youtube.com/watch?v=abc')).toBe(true);
    expect(isAllowedYouTubeUrl('https://m.youtube.com/watch?v=abc')).toBe(true);
    expect(isAllowedYouTubeUrl('https://youtu.be/abc')).toBe(true);
  });

  it('blocks arbitrary schemes, HTTP, and non-YouTube hosts', () => {
    expect(isAllowedYouTubeUrl('http://www.youtube.com/watch?v=abc')).toBe(false);
    expect(isAllowedYouTubeUrl('mailto:attacker@example.com')).toBe(false);
    expect(isAllowedYouTubeUrl('https://evil.example.com/watch?v=abc')).toBe(false);
    expect(isAllowedYouTubeUrl('not-a-url')).toBe(false);
  });
});
