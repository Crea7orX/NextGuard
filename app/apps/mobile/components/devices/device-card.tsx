import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Radio, Bell, Waves, DoorClosed, Battery, Plug, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';

type DeviceType = 'Hub' | 'Siren' | 'Motion' | 'Entry';

interface DeviceCardProps {
  id: string;
  type: DeviceType;
  name: string;
  description: string;
  addedAt: string;
  battery?: number; // Battery percentage (0-100)
  isPluggedIn?: boolean; // Whether device is plugged in
}

const deviceIcons = {
  Hub: Radio,
  Siren: Bell,
  Motion: Waves,
  Entry: DoorClosed,
};

export function DeviceCard({ id, type, name, description, addedAt, battery, isPluggedIn }: DeviceCardProps) {
  const DeviceIcon = deviceIcons[type];
  const router = useRouter();
  
  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Icon as={DeviceIcon} size={20} className="text-foreground" />
            <CardTitle>{name}</CardTitle>
          </View>
          <Text className="text-sm text-muted-foreground">{type}</Text>
        </View>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-muted-foreground">
            Added: {addedAt}
          </Text>
          {(battery !== undefined || isPluggedIn) && (
            <View className="flex-row items-center gap-1">
              {isPluggedIn ? (
                <>
                  <Icon as={Plug} size={14} className="text-green-500" />
                  <Text className="text-xs text-green-500">Plugged In</Text>
                </>
              ) : battery !== undefined ? (
                <>
                  <Icon as={Battery} size={14} className="text-foreground" />
                  <Text className="text-xs text-foreground">{battery}%</Text>
                </>
              ) : null}
            </View>
          )}
        </View>
        <View className="mt-2">
          <Button
            variant="outline"
            size="sm"
            onPress={() => router.push(`/devices/${id}`)}
            className="w-full"
          >
            <Icon as={Info} size={16} />
            <Text>View Details</Text>
          </Button>
        </View>
      </CardContent>
    </Card>
  );
}
