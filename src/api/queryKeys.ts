export const queryKeys = {
  status: (baseUrl: string) => ['status', baseUrl] as const,
  channels: (baseUrl: string, monitoring?: string, query?: string, limit?: number, offset?: number) =>
    ['channels', baseUrl, monitoring ?? 'monitored', query ?? '', limit ?? 50, offset ?? 0] as const,
  activity: (baseUrl: string, status?: string, limit?: number, offset?: number) =>
    ['activity', baseUrl, status ?? 'all', limit ?? 50, offset ?? 0] as const,
};
