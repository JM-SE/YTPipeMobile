import { configFormSchema, normalizeApiBaseUrl, normalizeToken } from '../config/configSchema';

describe('config schema', () => {
  it('accepts valid HTTP/HTTPS URLs including localhost variants', () => {
    const inputs = [
      'https://api.example.com',
      'http://localhost:4000',
      'http://127.0.0.1:8000',
      'http://10.0.2.2:4000',
    ];

    for (const url of inputs) {
      const result = configFormSchema.safeParse({ apiBaseUrl: url, mobileApiToken: 'token' });
      expect(result.success).toBe(true);
    }
  });

  it('normalizes base URL trailing slash', () => {
    expect(normalizeApiBaseUrl(' https://api.example.com/// ')).toBe('https://api.example.com');
  });

  it('rejects invalid or unsupported base URLs', () => {
    const inputs = ['', 'notaurl', 'ftp://example.com'];

    for (const url of inputs) {
      const result = configFormSchema.safeParse({ apiBaseUrl: url, mobileApiToken: 'token' });
      expect(result.success).toBe(false);
    }
  });

  it('rejects empty token and normalizes token spaces', () => {
    const result = configFormSchema.safeParse({ apiBaseUrl: 'https://api.example.com', mobileApiToken: '' });
    expect(result.success).toBe(false);
    expect(normalizeToken('  dev-mobile-token  ')).toBe('dev-mobile-token');
  });
});
