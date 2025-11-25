import { Text } from '@/components/ui/text';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DeviceCard } from '@/components/devices/device-card';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();

  const devices = [
    {
      type: 'Hub' as const,
      name: 'Main Hub',
      description: 'Central control unit - Living room',
      addedAt: '2024-11-15',
      isPluggedIn: true,
    },
    {
      type: 'Siren' as const,
      name: 'Outdoor Siren',
      description: 'Alarm system - Front entrance',
      addedAt: '2024-11-10',
      battery: 85,
    },
    {
      type: 'Motion' as const,
      name: 'Motion Sensor',
      description: 'Movement detector - Hallway',
      addedAt: '2024-11-01',
      battery: 92,
    },
    {
      type: 'Entry' as const,
      name: 'Front Door',
      description: 'Entry sensor - Main entrance',
      addedAt: '2024-10-28',
      battery: 78,
    },
  ];

  return (
    <ScrollView 
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top }}
    >
      <View className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-2">Dashboard</Text>
        <Text className="text-muted-foreground mb-6">Manage your connected devices</Text>
        
        {devices.map((device, index) => (
          <DeviceCard
            key={index}
            id={index.toString()}
            type={device.type}
            name={device.name}
            description={device.description}
            addedAt={device.addedAt}
            battery={device.battery}
            isPluggedIn={device.isPluggedIn}
          />
        ))}
      </View>
    </ScrollView>
  );
}
