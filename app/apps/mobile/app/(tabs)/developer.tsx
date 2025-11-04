import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface StorageItem {
  key: string;
  value: string;
}

export default function DeveloperScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [storageItems, setStorageItems] = useState<StorageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const openSitemap = () => {
    router.push('/_sitemap' as any);
  };

  const inspectStorage = async () => {
    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const AsyncStorageModule = require('@react-native-async-storage/async-storage');
      // Handle environments that export the module as a default export
      const AsyncStorage = (AsyncStorageModule && (AsyncStorageModule.default ?? AsyncStorageModule)) as any;

      if (!AsyncStorage || typeof AsyncStorage.getAllKeys !== 'function') {
        throw new Error('AsyncStorage API not available (getAllKeys is not a function)');
      }

      const keys = await AsyncStorage.getAllKeys();
      const items = keys && keys.length > 0 ? await AsyncStorage.multiGet(keys) : [];
      
      const storageData: StorageItem[] = items.map(([key, value]: [string, string | null]) => ({
        key,
        value: value ?? 'null',
      }));
      
      setStorageItems(storageData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load storage items: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearStorage = async () => {
    Alert.alert(
      'Clear Storage',
      'Are you sure you want to clear all storage items? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              const AsyncStorageModule = require('@react-native-async-storage/async-storage');
              const AsyncStorage = (AsyncStorageModule && (AsyncStorageModule.default ?? AsyncStorageModule)) as any;
              if (!AsyncStorage || typeof AsyncStorage.clear !== 'function') {
                throw new Error('AsyncStorage.clear is not available');
              }
              await AsyncStorage.clear();
              setStorageItems([]);
              Alert.alert('Success', 'Storage cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear storage: ' + (error as Error).message);
            }
          },
        },
      ]
    );
  };

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
        <Button onPress={openSitemap}>
          <Text>Open Sitemap</Text>
        </Button>
        
        <Button onPress={inspectStorage} disabled={isLoading}>
          <Text>{isLoading ? 'Loading...' : 'Inspect Storage'}</Text>
        </Button>

        {storageItems.length > 0 && (
          <Button onPress={clearStorage} variant="destructive">
            <Text>Clear All Storage</Text>
          </Button>
        )}
      </View>

      {storageItems.length > 0 && (
        <Card>
          <CardHeader>
            <Text className="text-lg font-semibold">Storage Items ({storageItems.length})</Text>
          </CardHeader>
          <CardContent className="gap-3">
            {storageItems.map((item) => (
              <View key={item.key} className="border-b border-border pb-3 last:border-b-0 last:pb-0">
                <Text className="font-mono text-sm font-semibold text-primary mb-1">
                  {item.key}
                </Text>
                <Text className="font-mono text-xs text-muted-foreground">
                  {item.value}
                </Text>
              </View>
            ))}
          </CardContent>
        </Card>
      )}

      {storageItems.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-8">
            <Text className="text-center text-muted-foreground">
              No storage items found. Tap "Inspect Storage" to load.
            </Text>
          </CardContent>
        </Card>
      )}
    </ScrollView>
  );
}
