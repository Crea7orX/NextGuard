import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { Code2, FileText } from 'lucide-react-native';
import { View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';

interface Route {
  path: string;
  title: string;
}

const discoverRoutes = (): Route[] => {
  const routes: Route[] = [
    // Tab routes
    { path: '/(tabs)/', title: 'Home' },
    { path: '/(tabs)/dashboard', title: 'Dashboard' },
    { path: '/(tabs)/more', title: 'More' },
    { path: '/(tabs)/developer', title: 'Developer' },
    
    // Auth routes
    { path: '/auth/welcome', title: 'Welcome' },
    { path: '/auth/sign-in', title: 'Sign In' },
    { path: '/auth/sign-up', title: 'Sign Up' },
    { path: '/auth/forgot-password', title: 'Forgot Password' },
    { path: '/auth/verify-email', title: 'Verify Email' },
    
    // Other routes
    { path: '/+not-found', title: 'Not Found' },
  ];
  
  return routes.sort((a, b) => a.path.localeCompare(b.path));
};

export default function DeveloperScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    setRoutes(discoverRoutes());
  }, []);

  const navigateTo = (path: string) => {
    try {
      router.push(path as any);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const renderRouteItem = (route: Route) => {
    const isCurrentPage = route.path === '/(tabs)/developer';

    return (
      <Pressable
        key={route.path}
        onPress={() => !isCurrentPage && navigateTo(route.path)}
        disabled={isCurrentPage}
      >
        <Card className={isCurrentPage ? 'opacity-50' : ''}>
          <CardContent className="flex-row items-center gap-4 py-4">
            <View className="bg-primary rounded-lg p-3">
              <FileText size={20} className="text-primary" color="currentColor" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-base">
                {route.title}
                {isCurrentPage && ' (Current)'}
              </Text>
              <Text className="text-muted-foreground text-xs mt-1 font-mono">
                {route.path}
              </Text>
            </View>
          </CardContent>
        </Card>
      </Pressable>
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
        paddingHorizontal: 16,
      }}
    >
      {/* Header */}
      <View className="mb-6">
        <View className="flex-row items-center gap-3 mb-2">
          <View className="bg-primary rounded-lg p-2">
            <Code2 size={28} />
          </View>
          <View>
            <Text className="text-3xl font-bold">Developer</Text>
            <Text className="text-muted-foreground">App Route Navigator</Text>
          </View>
        </View>
        <Text className="text-muted-foreground mt-2">
          Navigate to any screen in the app. Tap on a route to visit that page.
        </Text>
      </View>

      {/* All Routes */}
      <View className="gap-3">
        {routes.map(renderRouteItem)}
      </View>
    </ScrollView>
  );
}
