import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  timestamp: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Listen for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);

        const newNotification: NotificationData = {
          id: notification.request.identifier,
          title: notification.request.content.title || 'Notification',
          body: notification.request.content.body || '',
          data: notification.request.content.data,
          timestamp: Date.now(),
        };

        setNotifications((prev) => [newNotification, ...prev]);
      }
    );

    // Listen for user tapping on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response);

        const data = response.notification.request.content.data;

        // Handle navigation based on notification data
        if (data?.screen) {
          router.push(data.screen as any);
        } else if (data?.deviceId) {
          router.push(`/devices/${data.deviceId}` as any);
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [router]);

  const clearNotifications = () => {
    setNotifications([]);
    Notifications.setBadgeCountAsync(0);
  };

  return {
    notifications,
    clearNotifications,
  };
}