import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Channel } from '../api/types';

export type SetupStackParamList = {
  Welcome: undefined;
  Settings: undefined;
};

export type AppTabsParamList = {
  Dashboard: undefined;
  Channels: undefined;
  Activity: undefined;
};

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<AppTabsParamList> | undefined;
  Settings: undefined;
  ChannelDetail: { channel: Channel };
};
