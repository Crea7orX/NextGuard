import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { Shield, ShieldCheck, ShieldAlert, Activity, Home, Bell, User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { authClient } from '@/lib/auth-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeviceCard } from '@/components/devices/device-card';

export default function HomeScreen() {
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user } = useAuth();
  const { data: session } = authClient.useSession();
  const [systemStatus] = React.useState<'armed' | 'disarmed' | 'alert'>('disarmed');

  // Mock devices data
  const devices = [
    {
      type: 'Hub' as const,
      name: 'Main Hub',
      description: 'Central control unit - Living room',
      addedAt: '2024-11-15',
      isPluggedIn: true,
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

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'armed':
        return 'text-green-600';
      case 'alert':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = () => {
    switch (systemStatus) {
      case 'armed':
        return ShieldCheck;
      case 'alert':
        return ShieldAlert;
      default:
        return Shield;
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 20 }}
    >
      <View className="flex-1 gap-6 p-4">
        {/* Header */}
        <View className="gap-2">
          <Text className="text-3xl font-bold">Home</Text>
          {user && (
            <Text className="text-muted-foreground">Welcome back, {user.name?.split(' ')[0]}</Text>
          )}
        </View>

        {/* System Status Card */}
        <Card>
          <CardHeader>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <CardTitle>System Status</CardTitle>
                <CardDescription>Your security system is currently</CardDescription>
              </View>
              <View className="h-14 w-14 rounded-full bg-primary/10 items-center justify-center">
                <Icon as={getStatusIcon()} className={getStatusColor()} size={28} />
              </View>
            </View>
          </CardHeader>
          <CardContent>
            <View className="gap-3">
              <Text className={`text-2xl font-semibold ${getStatusColor()}`}>
                {systemStatus.charAt(0).toUpperCase() + systemStatus.slice(1)}
              </Text>
              <Button className="w-full">
                <Text>
                  {systemStatus === 'armed' ? 'Disarm System' : 'Arm System'}
                </Text>
              </Button>
            </View>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <View className="flex-row gap-3">
          <Card className="flex-1 aspect-square">
            <CardHeader className="pb-2">
              <View className="items-center gap-2">
                <Icon as={Home} className="text-primary" size={24} />
                <CardTitle className="text-base">Devices</CardTitle>
              </View>
            </CardHeader>
            <CardContent className="items-center">
              <Text className="text-3xl font-bold">{devices.length + 1}</Text>
              <CardDescription className="text-xs text-center">Active devices</CardDescription>
            </CardContent>
          </Card>

          <Card className="flex-1 aspect-square">
            <CardHeader className="pb-2">
              <View className="items-center gap-2">
                <Icon as={Activity} className="text-primary" size={24} />
                <CardTitle className="text-base">Activity</CardTitle>
              </View>
            </CardHeader>
            <CardContent className="items-center">
              <Text className="text-3xl font-bold">12</Text>
              <CardDescription className="text-xs text-center">Events today</CardDescription>
            </CardContent>
          </Card>

          <Card className="flex-1 aspect-square">
            <CardHeader className="pb-2">
              <View className="items-center gap-2">
                <Icon as={Bell} className="text-primary" size={24} />
                <CardTitle className="text-base">Alerts</CardTitle>
              </View>
            </CardHeader>
            <CardContent className="items-center">
              <Text className="text-3xl font-bold">0</Text>
              <CardDescription className="text-xs text-center">Unread alerts</CardDescription>
            </CardContent>
          </Card>
        </View>

        {/* Recent Devices */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-semibold">Recent Devices</Text>
            <Link href="/(tabs)/dashboard" asChild>
              <Button variant="ghost" size="sm">
                <Text className="text-primary">View All</Text>
              </Button>
            </Link>
          </View>

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

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events from your security system</CardDescription>
          </CardHeader>
          <CardContent>
            <View className="gap-3">
              <View className="flex-row items-start gap-3">
                <View className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                <View className="flex-1">
                  <Text className="font-medium">System Disarmed</Text>
                  <Text className="text-sm text-muted-foreground">Today at 8:30 AM</Text>
                </View>
              </View>
              <View className="flex-row items-start gap-3">
                <View className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                <View className="flex-1">
                  <Text className="font-medium">Motion Detected - Hallway</Text>
                  <Text className="text-sm text-muted-foreground">Today at 7:15 AM</Text>
                </View>
              </View>
              <View className="flex-row items-start gap-3">
                <View className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                <View className="flex-1">
                  <Text className="font-medium">System Armed</Text>
                  <Text className="text-sm text-muted-foreground">Yesterday at 11:45 PM</Text>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}
