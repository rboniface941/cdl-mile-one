import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

// Only import notifications on native platforms
let Notifications: typeof import('expo-notifications') | null = null;
let Device: typeof import('expo-device') | null = null;

if (Platform.OS !== 'web') {
  Notifications = require('expo-notifications');
  Device = require('expo-device');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export function useNotifications() {
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web' || !Notifications) return;

    registerForPushNotifications();
    scheduleDailyReminder();

    notificationListener.current = Notifications.addNotificationReceivedListener((_notification) => {});
    responseListener.current = Notifications.addNotificationResponseReceivedListener((_response) => {});

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return {};
}

async function registerForPushNotifications() {
  if (!Notifications || !Device || !Device.isDevice) return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-reminder', {
      name: 'Daily Reminder',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

async function scheduleDailyReminder() {
  if (!Notifications) return;

  // Cancel existing scheduled notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule daily at 8 AM
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Keep your streak alive!',
      body: '5 minutes of practice today keeps you on track for your CDL.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0,
    },
  });
}
