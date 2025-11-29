import { Text } from '@/components/ui/text';
import { View, ScrollView, Pressable } from 'react-native';
import ThemeSwitch from '@/components/settings/theme-switch';
import BiometricSwitch from '@/components/settings/biometric-switch';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileCard } from '@/components/account';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import { useState, useRef } from 'react';
import Constants from 'expo-constants';
import { useColorScheme } from 'nativewind';
import { useAuth } from '@/hooks/useAuth';

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const { enableDeveloperMode } = useDeveloperMode();
  const [tapCount, setTapCount] = useState(0);
  const tapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const appName = Constants.expoConfig?.name || 'NextGuard';
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const handleVersionTap = () => {
    if (tapTimeout.current) {
      clearTimeout(tapTimeout.current);
    }

    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (newCount >= 10) {
      enableDeveloperMode();
      setTapCount(0);
      console.log('Developer mode enabled!');
    } else {
      tapTimeout.current = setTimeout(() => {
        setTapCount(0);
      }, 2000);
    }
  };

  const textColor = colorScheme === 'dark' ? '#a1a1aa' : '#71717a';

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}
    >
      <ProfileCard
        onAccountDetailsPress={() => console.log('Account details pressed')}
      />

      <View className="w-full px-4 gap-4">
        <View className="bg-card rounded-lg border border-border mt-4">
          <BiometricSwitch />
        </View>
        <View className="bg-card rounded-lg border border-border">
          <ThemeSwitch label="Appearance" />
        </View>
      </View>

      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-2xl font-bold">More</Text>
        <Text className="mt-2 text-muted-foreground">
          Additional options and features
        </Text>
      </View>

      {/* App Info - Tappable to enable dev mode */}
      <Pressable
        onPress={handleVersionTap}
        className="items-center py-6"
        style={{ opacity: tapCount > 3 ? 0.6 : 1 }}
      >
        <Text className="text-sm font-semibold" style={{ color: textColor }}>
          {appName}
        </Text>
        <Text className="text-xs mt-1" style={{ color: textColor }}>
          Version {appVersion}
        </Text>
        {tapCount > 0 && tapCount < 10 && (
          <Text className="text-xs mt-2" style={{ color: textColor }}>
            {10 - tapCount} more {10 - tapCount === 1 ? 'tap' : 'taps'} to enable dev mode
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
