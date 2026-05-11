import type { ApiClientConfig } from './client';
import { apiRequest } from './client';
import type {
  MobilePushStatusResponse,
  PatchMobilePushSettingsRequest,
  PatchMobilePushSettingsResponse,
  RegisterMobilePushInstallationRequest,
  RegisterMobilePushInstallationResponse,
  SendMobilePushTestRequest,
  SendMobilePushTestResponse,
  UnregisterMobilePushInstallationResponse,
} from './types';
import { parseApiResponse } from './validation/parseResponse';
import {
  mobilePushStatusResponseSchema,
  patchMobilePushSettingsResponseSchema,
  registerMobilePushInstallationResponseSchema,
  sendMobilePushTestResponseSchema,
  unregisterMobilePushInstallationResponseSchema,
} from './validation/schemas';

export async function getMobilePushStatus(config: ApiClientConfig, installationId: string): Promise<MobilePushStatusResponse> {
  const response = await apiRequest<unknown>(config, '/internal/mobile-push/status', {
    method: 'GET',
    query: { installation_id: installationId },
  });
  return parseApiResponse(mobilePushStatusResponseSchema, response, 'GET /internal/mobile-push/status', config.mobileApiToken);
}

export async function registerMobilePushInstallation(
  config: ApiClientConfig,
  body: RegisterMobilePushInstallationRequest,
): Promise<RegisterMobilePushInstallationResponse> {
  const response = await apiRequest<unknown>(config, '/internal/mobile-push/register', {
    method: 'POST',
    body,
  });
  return parseApiResponse(
    registerMobilePushInstallationResponseSchema,
    response,
    'POST /internal/mobile-push/register',
    config.mobileApiToken,
  );
}

export async function unregisterMobilePushInstallation(
  config: ApiClientConfig,
  installationId: string,
): Promise<UnregisterMobilePushInstallationResponse> {
  const response = await apiRequest<unknown>(config, `/internal/mobile-push/installations/${encodeURIComponent(installationId)}`, {
    method: 'DELETE',
  });
  return parseApiResponse(
    unregisterMobilePushInstallationResponseSchema,
    response,
    'DELETE /internal/mobile-push/installations/{installation_id}',
    config.mobileApiToken,
  );
}

export async function patchMobilePushSettings(
  config: ApiClientConfig,
  body: PatchMobilePushSettingsRequest,
): Promise<PatchMobilePushSettingsResponse> {
  const response = await apiRequest<unknown>(config, '/internal/mobile-push/settings', {
    method: 'PATCH',
    body,
  });
  return parseApiResponse(
    patchMobilePushSettingsResponseSchema,
    response,
    'PATCH /internal/mobile-push/settings',
    config.mobileApiToken,
  );
}

export async function sendMobilePushTest(
  config: ApiClientConfig,
  body: SendMobilePushTestRequest,
): Promise<SendMobilePushTestResponse> {
  const response = await apiRequest<unknown>(config, '/internal/mobile-push/test', {
    method: 'POST',
    body,
  });
  return parseApiResponse(sendMobilePushTestResponseSchema, response, 'POST /internal/mobile-push/test', config.mobileApiToken);
}
