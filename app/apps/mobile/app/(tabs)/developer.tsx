import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DeveloperModeToggle from '@/components/settings/developer-mode-toggle';

interface StorageItem {
  key: string;
  value: string;
}

export default function DeveloperScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const openSitemap = () => router.push('/_sitemap' as any);
  const openStorageInspector = () => router.push('/dev/tools/storage' as any);
  const openNotificationManager = () => router.push('/dev/tools/notifications' as any);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
        paddingHorizontal: 16,
        gap: 16,
      }}
    >
      <View className="gap-3">
        <View>
          <Text className="text-lg font-medium text-foreground">Developer Options</Text>
        </View>

        <View className="w-full">
          <DeveloperModeToggle />
        </View>

        <Button onPress={openSitemap}>
          <Text>Open Sitemap</Text>
        </Button>

        <Button onPress={openStorageInspector}>
          <Text>Open Storage Inspector</Text>
        </Button>

        <Button onPress={openNotificationManager}>
          <Text>Open Notification Manager</Text>
        </Button>
      </View>      
    </ScrollView>
  );
}
