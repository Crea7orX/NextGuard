import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { View, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNotifications } from "@/hooks/useNotifications";
import {
  scheduleLocalNotification,
  setBadgeCount,
} from "@/services/notifications";
import { Bell, BellOff } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { notifications, clearNotifications } = useNotifications();

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
        <Text className="text-2xl font-bold">Notifications</Text>

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
            <Card key={notification.id}>
              <CardHeader>
                <Text className="font-semibold">{notification.title}</Text>
                <Text className="text-muted-foreground text-xs">
                  {new Date(notification.timestamp).toLocaleString()}
                </Text>
              </CardHeader>
              <CardContent>
                <Text className="text-sm">{notification.body}</Text>
              </CardContent>
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
