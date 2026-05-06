import AsyncStorage from '@react-native-async-storage/async-storage';

const CHANNEL_EDUCATION_PREFIX = 'ytpipe:channels:first-monitoring-activation-ack:';

export function channelEducationKey(baseUrl: string) {
  return `${CHANNEL_EDUCATION_PREFIX}${baseUrl}`;
}

export async function hasAcknowledgedChannelEducation(baseUrl: string) {
  return (await AsyncStorage.getItem(channelEducationKey(baseUrl))) === 'true';
}

export async function acknowledgeChannelEducation(baseUrl: string) {
  await AsyncStorage.setItem(channelEducationKey(baseUrl), 'true');
}
