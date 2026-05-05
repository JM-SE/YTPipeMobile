import * as client from '../api/client';
import {
  getActivity,
  getChannels,
  getStatus,
  runPoll,
  syncSubscriptions,
  updateChannelMonitoring,
} from '../api/mobileApi';

const config = {
  apiBaseUrl: 'http://10.0.2.2:4000',
  mobileApiToken: 'dev-mobile-token',
};

describe('mobileApi endpoint coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls status endpoint', async () => {
    const spy = jest.spyOn(client, 'apiRequest').mockResolvedValue({} as never);
    await getStatus(config);
    expect(spy).toHaveBeenCalledWith(config, '/status', { method: 'GET' });
  });

  it('calls channels endpoint', async () => {
    const spy = jest.spyOn(client, 'apiRequest').mockResolvedValue({} as never);
    await getChannels(config, { monitoring: 'all', limit: 10, offset: 0, query: 'react' });
    expect(spy).toHaveBeenCalledWith(config, '/internal/channels', {
      method: 'GET',
      query: { monitoring: 'all', limit: 10, offset: 0, query: 'react' },
    });
  });

  it('calls channel monitoring update endpoint', async () => {
    const spy = jest.spyOn(client, 'apiRequest').mockResolvedValue({} as never);
    await updateChannelMonitoring(config, 123, { is_monitored: true });
    expect(spy).toHaveBeenCalledWith(config, '/internal/channels/123/monitoring', {
      method: 'PATCH',
      body: { is_monitored: true },
    });
  });

  it('calls sync endpoint', async () => {
    const spy = jest.spyOn(client, 'apiRequest').mockResolvedValue({} as never);
    await syncSubscriptions(config);
    expect(spy).toHaveBeenCalledWith(config, '/internal/subscriptions/sync', { method: 'POST' });
  });

  it('calls run poll endpoint', async () => {
    const spy = jest.spyOn(client, 'apiRequest').mockResolvedValue({} as never);
    await runPoll(config);
    expect(spy).toHaveBeenCalledWith(config, '/internal/run-poll', { method: 'POST' });
  });

  it('calls activity endpoint', async () => {
    const spy = jest.spyOn(client, 'apiRequest').mockResolvedValue({} as never);
    await getActivity(config, { status: 'failed', limit: 20, offset: 0 });
    expect(spy).toHaveBeenCalledWith(config, '/internal/activity', {
      method: 'GET',
      query: { status: 'failed', limit: 20, offset: 0 },
    });
  });
});
