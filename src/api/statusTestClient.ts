import { getStatus } from './mobileApi';

export type TestStatusSuccess = {
  environment?: string;
  ready?: boolean;
};

export async function testStatusConnection(apiBaseUrl: string, mobileApiToken: string): Promise<TestStatusSuccess> {
  const result = await getStatus({ apiBaseUrl, mobileApiToken });
  return {
    environment: result.environment,
    ready: result.ready,
  };
}
