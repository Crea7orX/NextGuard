import { Tabs } from 'expo-router';
import { Home, LayoutDashboard, LucideMenu, Code2 } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useColorScheme } from 'nativewind';
import { Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CustomTabBarButton({ children, onPress, style, ...props }: any) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.85, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 100, stiffness: 400 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}

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
          paddingHorizontal: 12,
        },
        headerShown: false,
        tabBarButton: (props) => <CustomTabBarButton {...props} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Icon as={Home} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Icon as={LayoutDashboard} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <Icon as={LucideMenu} color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="developer"
        options={{
          title: 'Dev',
          tabBarIcon: ({ color, size }) => <Icon as={Code2} color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
