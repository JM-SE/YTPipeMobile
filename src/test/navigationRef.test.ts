import {
  clearPendingNotificationNavigationForTest,
  flushPendingNotificationNavigation,
  navigateToActivityFromNotification,
  navigateToSettingsFromNotification,
  navigationRef,
} from '../navigation/navigationRef';

describe('notification navigation helpers', () => {
  beforeEach(() => {
    clearPendingNotificationNavigationForTest();
    jest.spyOn(navigationRef, 'isReady').mockReturnValue(false);
    jest.spyOn(navigationRef, 'navigate').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
    clearPendingNotificationNavigationForTest();
  });

  it('queues Activity navigation until the navigation container is ready', () => {
    navigateToActivityFromNotification();

    expect(navigationRef.navigate).not.toHaveBeenCalled();

    jest.spyOn(navigationRef, 'isReady').mockReturnValue(true);
    flushPendingNotificationNavigation();

    expect(navigationRef.navigate).toHaveBeenCalledWith('MainTabs', { screen: 'Activity' });
  });

  it('queues Settings navigation until the navigation container is ready', () => {
    navigateToSettingsFromNotification();

    jest.spyOn(navigationRef, 'isReady').mockReturnValue(true);
    flushPendingNotificationNavigation();

    expect(navigationRef.navigate).toHaveBeenCalledWith('Settings');
  });
});
