import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { StarIcon, User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, type ImageStyle, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { authClient } from '@/lib/auth-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const LOGO = {
  light: require('@/assets/images/react-native-reusables-light.png'),
  dark: require('@/assets/images/react-native-reusables-dark.png'),
};

const IMAGE_STYLE: ImageStyle = {
  height: 76,
  width: 76,
};

export default function HomeScreen() {
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user } = useAuth();
  const { data: session } = authClient.useSession();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top }}
    >
      <View className="flex-1 items-center justify-center gap-8 p-4 pt-16">
        <Image source={LOGO[colorScheme ?? 'light']} style={IMAGE_STYLE} resizeMode="contain" />
        <Text className="text-2xl font-bold">Welcome to NextGuard</Text>
        
        {/* User Info Card - Demonstrates Auth Provider */}
        {isAuthenticated && user && (
          <Card className="w-full max-w-md">
            <CardHeader>
              <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 rounded-full bg-primary items-center justify-center">
                  <Icon as={User} className="text-primary-foreground" size={24} />
                </View>
                <View className="flex-1">
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <CardDescription className="text-sm">{user.email}</CardDescription>
                </View>
              </View>
            </CardHeader>
            <CardContent>
              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">
                  Session ID: {session?.session?.id?.slice(0, 8)}...
                </Text>
                <Text className="text-sm text-muted-foreground">
                  User ID: {user.id}
                </Text>
              </View>
            </CardContent>
          </Card>
        )}

        <View className="gap-2 p-4">
          <Text className="ios:text-foreground font-mono text-sm text-muted-foreground">
            1. Edit <Text variant="code">app/(tabs)/index.tsx</Text> to get started.
          </Text>
          <Text className="ios:text-foreground font-mono text-sm text-muted-foreground">
            2. Save to see your changes instantly.
          </Text>
          {isAuthenticated && (
            <Text className="ios:text-foreground font-mono text-sm text-green-600">
              ✓ Auth Provider is working!
            </Text>
          )}
        </View>
        <View className="flex-row gap-2">
          <Link href="https://reactnativereusables.com" asChild>
            <Button>
              <Text>Browse the Docs</Text>
            </Button>
          </Link>
          <Link href="https://github.com/founded-labs/react-native-reusables" asChild>
            <Button variant="ghost">
              <Text>Star the Repo</Text>
              <Icon as={StarIcon} />
            </Button>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
