import type { Request, Response } from 'express';
import { MOCK_TOKEN } from './seed';
import type { Channel, DeliveryStatus, MonitoringFilter, Pagination } from './types';

export const sendDetail = (res: Response, status: number, detail: string) => {
  res.status(status).json({ detail });
};

export const authError = (res: Response) => sendDetail(res, 401, 'Missing or invalid mobile API token');

export const validationError = (res: Response, detail: string) => sendDetail(res, 422, detail);

export const notFoundError = (res: Response, detail = 'Resource not found') => sendDetail(res, 404, detail);

export const prerequisiteError = (res: Response, detail: string) => sendDetail(res, 409, detail);

export const upstreamError = (res: Response, detail: string) => sendDetail(res, 502, detail);

export const hasValidMobileToken = (req: Request) => {
  const authHeader = req.header('authorization');
  return authHeader === `Bearer ${MOCK_TOKEN}`;
};

export const getStringQuery = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
};

export const parseLimitOffset = (req: Request): { limit: number; offset: number } | { error: string } => {
  const limitRaw = getStringQuery(req.query.limit);
  const offsetRaw = getStringQuery(req.query.offset);
  const limit = limitRaw === undefined ? 50 : Number(limitRaw);
  const offset = offsetRaw === undefined ? 0 : Number(offsetRaw);

  if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
    return { error: 'limit must be an integer from 1 to 200' };
  }

  if (!Number.isInteger(offset) || offset < 0) {
    return { error: 'offset must be an integer greater than or equal to 0' };
  }

  return { limit, offset };
};

export const paginate = <T>(items: T[], limit: number, offset: number): { items: T[]; pagination: Pagination } => ({
  items: items.slice(offset, offset + limit),
  pagination: { limit, offset, total: items.length },
});

export const parseMonitoringFilter = (value: unknown): MonitoringFilter | undefined => {
  const raw = getStringQuery(value);
  if (raw === undefined) return 'monitored';
  if (raw === 'monitored' || raw === 'unmonitored' || raw === 'all') return raw;
  return undefined;
};

export const filterChannels = (channels: Channel[], monitoring: MonitoringFilter, query?: string) => {
  const byMonitoring = channels.filter((channel) => {
    if (monitoring === 'all') return true;
    return monitoring === 'monitored' ? channel.is_monitored : !channel.is_monitored;
  });

  const normalizedQuery = query?.trim().toLowerCase();
  if (!normalizedQuery) return byMonitoring;

  return byMonitoring.filter((channel) =>
    [channel.title, channel.youtube_channel_id]
      .some((value) => value.toLowerCase().includes(normalizedQuery)),
  );
};

export const parseDeliveryStatusFilter = (value: unknown): DeliveryStatus | 'all' | undefined => {
  const raw = getStringQuery(value);
  if (raw === undefined) return 'all';
  if (raw === 'all' || raw === 'pending' || raw === 'delivered' || raw === 'pending_retry' || raw === 'failed') {
    return raw;
  }
  return undefined;
};

export const assertKnownScenario = (
  res: Response,
  scenario: string | undefined,
  allowed: string[],
) => {
  if (scenario === undefined || allowed.includes(scenario)) return true;
  validationError(res, `Unknown scenario '${scenario}'`);
  return false;
};
