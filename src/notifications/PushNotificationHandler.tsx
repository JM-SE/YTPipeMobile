import type { ComponentType } from 'react';

import { isRemotePushRuntimeAvailable } from './pushRuntimeEnvironment';

export function PushNotificationHandler() {
  if (!isRemotePushRuntimeAvailable()) return null;

  const { PushNotificationRuntimeHandler } = require('./PushNotificationRuntimeHandler') as {
    PushNotificationRuntimeHandler: ComponentType;
  };

  return <PushNotificationRuntimeHandler />;
}
