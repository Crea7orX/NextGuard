import { Tabs } from 'expo-router';
import { Home, LayoutDashboard, MoreHorizontal } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  
  const activeColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  const inactiveColor = colorScheme === 'dark' ? '#737373' : '#A3A3A3';
  const backgroundColor = colorScheme === 'dark' ? '#171717' : '#FFFFFF';
  const borderColor = colorScheme === 'dark' ? '#262626' : '#E5E5E5';

  // Calculate tab bar height with safe area
  const tabBarHeight = Platform.select({
    ios: 49 + insets.bottom,
    android: 56,
    default: 60,
  });

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor,
          borderTopWidth: 1,
          borderTopColor: borderColor,
          height: tabBarHeight,
          paddingBottom: Platform.select({
            ios: insets.bottom,
            android: 8,
            default: 8,
          }),
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <MoreHorizontal color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
