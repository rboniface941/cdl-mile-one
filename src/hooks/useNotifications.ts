import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { useAuthContext } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

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
  const { profile } = useAuthContext();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web' || !Notifications) return;

    registerForPushNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener((_notification) => {});
    responseListener.current = Notifications.addNotificationResponseReceivedListener((_response) => {});

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  const scheduleNotifications = useCallback(async () => {
    if (Platform.OS === 'web' || !Notifications || !profile) return;

    await Notifications.cancelAllScheduledNotificationsAsync();

    // Quiz streak: daily at 8am
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Keep your streak going',
        body: '5 minutes of practice today keeps your streak going.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 8,
        minute: 0,
      },
    });

    // Streak save: 10pm if streak > 0
    if (profile.streak_count > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Don't lose your streak",
          body: `Don't lose your ${profile.streak_count}-day streak — one quick session before midnight.`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 22,
          minute: 0,
        },
      });
    }

    // Profile progression notifications based on completeness
    const completeness = profile.profile_completeness || 0;
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (completeness < 20 && daysSinceCreation >= 2) {
      await scheduleOneTime(
        Notifications,
        "Carriers can't see your profile yet",
        "It takes under 3 minutes to unlock your first matches.",
        2
      );
    } else if (completeness >= 20 && completeness <= 60 && daysSinceCreation >= 4) {
      await scheduleOneTime(
        Notifications,
        `You're ${completeness}% there`,
        `You're ${completeness}% of the way to applying to 10 carriers in one tap.`,
        4
      );
    } else if (completeness > 60 && completeness < 80 && daysSinceCreation >= 7) {
      await scheduleOneTime(
        Notifications,
        'Almost ready to apply',
        'Just your employment history left before you can apply to all carriers at once.',
        7
      );
    }

    // Carrier matching (only if profile > 60%)
    if (completeness > 60) {
      try {
        const { data: carriers } = await supabase
          .from('carriers')
          .select('company_name, equipment_type, location')
          .eq('is_active', true)
          .limit(1);

        if (carriers && carriers.length > 0) {
          const carrier = carriers[0];
          await scheduleOneTime(
            Notifications,
            `${carrier.company_name} is hiring`,
            `${carrier.company_name} is actively hiring ${carrier.equipment_type} drivers in ${carrier.location}. Your profile matches their requirements.`,
            14
          );
        }
      } catch (_) {}
    }

    // Graduation trigger for "in school" users at day 45
    if (profile.stage === 'in_school' && daysSinceCreation >= 45) {
      await scheduleOneTime(
        Notifications,
        'Ready to start your career?',
        `Most CDL students graduate around now. Your profile is ${completeness}% complete — finish it so carriers can find you the moment you have your license.`,
        45
      );
    }
  }, [profile]);

  useEffect(() => {
    scheduleNotifications();
  }, [scheduleNotifications]);

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

async function scheduleOneTime(
  Notifications: any,
  title: string,
  body: string,
  delayDays: number
) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: delayDays * 24 * 60 * 60,
      repeats: false,
    },
  });
}
