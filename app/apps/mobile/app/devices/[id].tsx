import { View, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Radio, Bell, Waves, DoorClosed, Battery, Plug, Signal, Lock } from 'lucide-react-native';
import BackButton from '@/components/ui/back-button';

type DeviceType = 'Hub' | 'Siren' | 'Motion' | 'Entry';

interface DeviceDetails {
  type: DeviceType;
  name: string;
  description: string;
  signalStrength: number; // in dBm
  battery?: number;
  isPluggedIn?: boolean;
  lidStatus: 'Open' | 'Closed';
  serialId: string;
  deviceVersion: string;
  uptime: number; // in seconds
  lastHeartbeat: number; // in seconds
  // Hub-specific fields
  networkMode?: string;
  localIpAddress?: string;
  macAddress?: string;
  ethernetSpeed?: string;
  ethernetDuplex?: string;
  cpuTemp?: number;
  cpuFrequency?: number;
  cpuCores?: number;
  usedMemory?: number;
  totalMemory?: number;
}

const deviceIcons = {
  Hub: Radio,
  Siren: Bell,
  Motion: Waves,
  Entry: DoorClosed,
};

// Mock data - replace with actual data fetching
const getDeviceDetails = (id: string): DeviceDetails => {
  const devices: Record<string, DeviceDetails> = {
    '0': {
      type: 'Hub',
      name: 'Main Hub',
      description: 'Central control unit - Living room',
      signalStrength: -45,
      isPluggedIn: true,
      lidStatus: 'Closed',
      serialId: '00000000-0000-4024-a000-000000000000',
      deviceVersion: '1.2.3',
      uptime: 86400,
      lastHeartbeat: 5,
      networkMode: 'ethernet',
      localIpAddress: '10.8.8.17',
      macAddress: '4C:C3:82:0C:E8:97',
      ethernetSpeed: '100 Mbps',
      ethernetDuplex: 'Full',
      cpuTemp: 24.44,
      cpuFrequency: 240.00,
      cpuCores: 2,
      usedMemory: 99.02,
      totalMemory: 320.70,
    },
    '1': {
      type: 'Siren',
      name: 'Outdoor Siren',
      description: 'Alarm system - Front entrance',
      signalStrength: -62,
      battery: 85,
      lidStatus: 'Closed',
      serialId: '11111111-1111-4024-a000-111111111111',
      deviceVersion: '1.0.5',
      uptime: 43200,
      lastHeartbeat: 3,
    },
    '2': {
      type: 'Motion',
      name: 'Motion Sensor',
      description: 'Movement detector - Hallway',
      signalStrength: -58,
      battery: 92,
      lidStatus: 'Closed',
      serialId: '22222222-2222-4024-a000-222222222222',
      deviceVersion: '1.1.0',
      uptime: 172800,
      lastHeartbeat: 8,
    },
    '3': {
      type: 'Entry',
      name: 'Front Door',
      description: 'Entry sensor - Main entrance',
      signalStrength: -55,
      battery: 78,
      lidStatus: 'Closed',
      serialId: '33333333-3333-4024-a000-333333333333',
      deviceVersion: '1.0.8',
      uptime: 259200,
      lastHeartbeat: 4,
    },
  };
  
  return devices[id] || devices['0'];
};

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
};

export default function DeviceDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const device = getDeviceDetails(id || '0');
  const DeviceIcon = deviceIcons[device.type];

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      <View className="flex-1 bg-background">
        {/* Sticky Header */}
        <View 
          className="bg-background border-b border-border"
          style={{ paddingTop: insets.top }}
        >
          <View className="flex-row items-center gap-3 px-4 py-3">
            <BackButton navigateTo="/(tabs)/dashboard" />
            <View className="flex-row items-center gap-2 flex-1">
              <Icon as={DeviceIcon} size={24} className="text-foreground" />
              <Text className="text-xl font-semibold">{device.name}</Text>
            </View>
          </View>
        </View>

        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          <View className="flex-1 p-4">
            {/* Basic Information */}
          <Card className="mb-4">
            <CardContent className="gap-3">
              <View>
                <Text className="text-xs text-muted-foreground mb-1">Name</Text>
                <Text className="text-base">{device.name}</Text>
              </View>
              <View>
                <Text className="text-xs text-muted-foreground mb-1">Description</Text>
                <Text className="text-base">{device.description}</Text>
              </View>
            </CardContent>
          </Card>

          {/* Status Information */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">Signal Strength</Text>
                <View className="flex-row items-center gap-2">
                  <Icon as={Signal} size={16} className="text-foreground" />
                  <Text className="text-base">{device.signalStrength} dBm</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">Battery</Text>
                <View className="flex-row items-center gap-2">
                  {device.isPluggedIn ? (
                    <>
                      <Icon as={Plug} size={16} className="text-green-500" />
                      <Text className="text-base text-green-500">Plugged In</Text>
                    </>
                  ) : (
                    <>
                      <Icon as={Battery} size={16} className="text-foreground" />
                      <Text className="text-base">{device.battery}%</Text>
                    </>
                  )}
                </View>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">Lid</Text>
                <View className="flex-row items-center gap-2">
                  <Icon as={Lock} size={16} className="text-foreground" />
                  <Text className="text-base">{device.lidStatus}</Text>
                </View>
              </View>
            </CardContent>
          </Card>

          {/* Device Information */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Device Information</CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              <View>
                <Text className="text-xs text-muted-foreground mb-1">Type</Text>
                <Text className="text-base">{device.type}</Text>
              </View>
              <View>
                <Text className="text-xs text-muted-foreground mb-1">Serial ID</Text>
                <Text className="text-xs font-mono">{device.serialId}</Text>
              </View>
              <View>
                <Text className="text-xs text-muted-foreground mb-1">Device Version</Text>
                <Text className="text-base">{device.deviceVersion}</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">Uptime</Text>
                <Text className="text-base">{formatUptime(device.uptime)}</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted-foreground">Last Heartbeat</Text>
                <Text className="text-base">{device.lastHeartbeat}s ago</Text>
              </View>
            </CardContent>
          </Card>

          {/* Network Information (Hub only) */}
          {device.type === 'Hub' && device.networkMode && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Network</CardTitle>
              </CardHeader>
              <CardContent className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted-foreground">Network Mode</Text>
                  <Text className="text-base">{device.networkMode}</Text>
                </View>
                <View>
                  <Text className="text-xs text-muted-foreground mb-1">Local IP Address</Text>
                  <Text className="text-base font-mono">{device.localIpAddress}</Text>
                </View>
                <View>
                  <Text className="text-xs text-muted-foreground mb-1">MAC Address</Text>
                  <Text className="text-base font-mono">{device.macAddress}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted-foreground">Ethernet Speed</Text>
                  <Text className="text-base">{device.ethernetSpeed}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted-foreground">Ethernet Duplex</Text>
                  <Text className="text-base">{device.ethernetDuplex}</Text>
                </View>
              </CardContent>
            </Card>
          )}

          {/* Performance Information (Hub only) */}
          {device.type === 'Hub' && device.cpuTemp !== undefined && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted-foreground">CPU Temperature</Text>
                  <Text className="text-base">{device.cpuTemp?.toFixed(2)}°C</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted-foreground">CPU Frequency</Text>
                  <Text className="text-base">{device.cpuFrequency?.toFixed(2)} MHz</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted-foreground">CPU Cores</Text>
                  <Text className="text-base">{device.cpuCores}</Text>
                </View>
                <View>
                  <Text className="text-xs text-muted-foreground mb-1">Used Dynamic Memory</Text>
                  <Text className="text-base">
                    {device.usedMemory?.toFixed(2)} KB / {device.totalMemory?.toFixed(2)} KB
                  </Text>
                  <View className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                    <View 
                      className="h-full bg-primary rounded-full" 
                      style={{ 
                        width: `${((device.usedMemory || 0) / (device.totalMemory || 1)) * 100}%` 
                      }} 
                    />
                  </View>
                </View>
              </CardContent>
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
    </>
  );
}
