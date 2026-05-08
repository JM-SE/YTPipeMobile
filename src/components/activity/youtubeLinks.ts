const TRUSTED_YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']);

export function isAllowedYouTubeUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && TRUSTED_YOUTUBE_HOSTS.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export const YOUTUBE_LINK_ERROR = 'Could not open YouTube link. Try again from another device/browser.';
