import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { Shield, ShieldCheck, ShieldAlert, Activity, Home, Bell, User, ChevronRight, Clock } from 'lucide-react-native';
import * as React from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeviceCard } from '@/components/devices/device-card';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
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
        return 'text-green-500';
      case 'alert':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  const getStatusBgColor = () => {
    switch (systemStatus) {
      case 'armed':
        return 'bg-green-500/10';
      case 'alert':
        return 'bg-red-500/10';
      default:
        return 'bg-blue-500/10';
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
      className="flex-1 bg-muted/30"
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 20 }}
    >
      <View className="flex-1 gap-5 p-5">
        {/* Enhanced Header */}
        <View className="gap-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                Dashboard
              </Text>
              <Text className="text-4xl font-bold tracking-tight mt-1">Home</Text>
              {user && (
                <Text className="text-base text-muted-foreground mt-1">
                  Welcome back, {user.name?.split(' ')[0]} 👋
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Enhanced System Status Card */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <View className="gap-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 gap-1">
                  <Text className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                    System Status
                  </Text>
                  <Text className={`text-3xl font-bold tracking-tight ${getStatusColor()}`}>
                    {systemStatus.charAt(0).toUpperCase() + systemStatus.slice(1)}
                  </Text>
                </View>
                <View className={`h-20 w-20 rounded-2xl ${getStatusBgColor()} items-center justify-center`}>
                  <Icon as={getStatusIcon()} className={getStatusColor()} size={40} strokeWidth={2} />
                </View>
              </View>
              
              <View className="h-px bg-border my-1" />
              
              <Button size="lg" className="w-full rounded-xl">
                <Text className="font-semibold">
                  {systemStatus === 'armed' ? 'Disarm System' : 'Arm System'}
                </Text>
              </Button>
            </View>
          </CardContent>
        </Card>

        {/* Enhanced Quick Stats */}
        <View className="gap-3">
          <Text className="text-lg font-semibold tracking-tight">Overview</Text>
          <View className="flex-row gap-3">
            <Card className="flex-1">
              <CardContent className="pt-5 pb-5 items-center gap-2">
                <View className="h-12 w-12 rounded-full bg-primary/10 items-center justify-center mb-1">
                  <Icon as={Home} className="text-primary" size={22} />
                </View>
                <Text className="text-2xl font-bold">{devices.length + 1}</Text>
                <Text className="text-xs text-muted-foreground font-medium">Devices</Text>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardContent className="pt-5 pb-5 items-center gap-2">
                <View className="h-12 w-12 rounded-full bg-blue-500/10 items-center justify-center mb-1">
                  <Icon as={Activity} className="text-blue-500" size={22} />
                </View>
                <Text className="text-2xl font-bold">12</Text>
                <Text className="text-xs text-muted-foreground font-medium">Events</Text>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardContent className="pt-5 pb-5 items-center gap-2">
                <View className="h-12 w-12 rounded-full bg-amber-500/10 items-center justify-center mb-1">
                  <Icon as={Bell} className="text-amber-500" size={22} />
                </View>
                <Text className="text-2xl font-bold">0</Text>
                <Text className="text-xs text-muted-foreground font-medium">Alerts</Text>
              </CardContent>
            </Card>
          </View>
        </View>

        {/* Enhanced Recent Devices */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold tracking-tight">Recent Devices</Text>
            <Link href="/(tabs)/dashboard" asChild>
              <Button variant="ghost" size="sm" className="flex-row gap-1">
                <Text className="text-primary font-medium">View All</Text>
                <Icon as={ChevronRight} className="text-primary" size={16} />
              </Button>
            </Link>
          </View>

          <View className="gap-2">
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
        </View>

        {/* Enhanced Recent Activity */}
        <View className="gap-3">
          <Text className="text-lg font-semibold tracking-tight">Recent Activity</Text>
          <Card>
            <CardContent className="pt-5 gap-4">
              <View className="flex-row items-start gap-3">
                <View className="h-10 w-10 rounded-full bg-green-500/10 items-center justify-center">
                  <View className="h-2.5 w-2.5 rounded-full bg-green-500" />
                </View>
                <View className="flex-1 pt-1">
                  <Text className="font-semibold">System Disarmed</Text>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <Icon as={Clock} className="text-muted-foreground" size={12} />
                    <Text className="text-xs text-muted-foreground">Today at 8:30 AM</Text>
                  </View>
                </View>
              </View>
              
              <View className="flex-row items-start gap-3">
                <View className="h-10 w-10 rounded-full bg-blue-500/10 items-center justify-center">
                  <View className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                </View>
                <View className="flex-1 pt-1">
                  <Text className="font-semibold">Motion Detected</Text>
                  <Text className="text-sm text-muted-foreground mt-0.5">Hallway sensor</Text>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <Icon as={Clock} className="text-muted-foreground" size={12} />
                    <Text className="text-xs text-muted-foreground">Today at 7:15 AM</Text>
                  </View>
                </View>
              </View>
              
              <View className="flex-row items-start gap-3">
                <View className="h-10 w-10 rounded-full bg-green-500/10 items-center justify-center">
                  <View className="h-2.5 w-2.5 rounded-full bg-green-500" />
                </View>
                <View className="flex-1 pt-1">
                  <Text className="font-semibold">System Armed</Text>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <Icon as={Clock} className="text-muted-foreground" size={12} />
                    <Text className="text-xs text-muted-foreground">Yesterday at 11:45 PM</Text>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
