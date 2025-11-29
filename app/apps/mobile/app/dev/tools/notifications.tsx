import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { View, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNotifications } from "@/hooks/useNotifications";
import {
  scheduleLocalNotification,
  setBadgeCount,
  getStoredPushToken,
} from "@/services/notifications";
import { Bell, BellOff } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { CopyButton } from "@/components/ui/copy-button";
import { useState, useEffect } from "react";
import BackButton from "@/components/ui/back-button";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { notifications, clearNotifications } = useNotifications();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    loadPushToken();
  }, []);

  const loadPushToken = async () => {
    const token = await getStoredPushToken();
    setExpoPushToken(token);
  };

  const sendTestNotification = async () => {
    try {
      await scheduleLocalNotification(
        "NextGuard Alert",
        "Motion detected at Front Door Camera",
        { deviceId: "camera-1", type: "motion" },
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to send notification. Make sure you have granted notification permissions.",
      );
      console.error("Failed to send notification:", error);
    }
  };

  const handleClearAll = async () => {
    clearNotifications();
    await setBadgeCount(0);
  };

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
        paddingHorizontal: 16,
        gap: 16,
      }}
    >
      <View className="gap-4">
        <View className='flex-row gap-2 items-center'>
          <BackButton />
          <Text className="text-2xl font-bold text-foreground">Notification Manager</Text>
        </View>

        {expoPushToken && (
          <Card className="p-6 pt-4 gap-0">
            <View className="flex-row items-center justify-between">
              <Text className="font-semibold">Expo Push Token</Text>
              <CopyButton
                value={expoPushToken}
                showText
                successMessage="Token copied!"
              />
            </View>
            <Text className="text-muted-foreground text-xs font-mono break-all">
              {expoPushToken}
            </Text>
          </Card>
        )}

        <View className="gap-3">
          <Button onPress={sendTestNotification}>
            <Icon as={Bell} className="text-primary-foreground size-4" />
            <Text>Send Test Notification</Text>
          </Button>

          {notifications.length > 0 && (
            <Button onPress={handleClearAll} variant="outline">
              <Icon as={BellOff} className="text-foreground size-4" />
              <Text>Clear All</Text>
            </Button>
          )}
        </View>
      </View>

      {notifications.length > 0 ? (
        <View className="gap-3">
          {notifications.map((notification) => (
            <Card key={notification.id} className="p-6 py-4 gap-0">
              <Text className="font-semibold">{notification.title}</Text>
              <Text className="text-muted-foreground text-xs">
                {new Date(notification.timestamp).toLocaleString()}
              </Text>
              <Text className="text-sm">{notification.body}</Text>
            </Card>
          ))}
        </View>
      ) : (
        <Card>
          <CardContent className="py-12">
            <View className="items-center gap-2">
              <Icon as={BellOff} className="text-muted-foreground size-12" />
              <Text className="text-muted-foreground text-center">
                No notifications yet
              </Text>
              <Text className="text-muted-foreground text-center text-xs">
                Tap the button above to send a test notification
              </Text>
            </View>
          </CardContent>
        </Card>
      )}
    </ScrollView>
  );
}
