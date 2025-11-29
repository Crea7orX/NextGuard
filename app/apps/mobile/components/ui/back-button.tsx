import React from 'react';
import { Pressable, StyleSheet, PressableProps } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Icon } from '@/components/ui/icon';

type BackButtonProps = {
  color?: string;
  size?: number;
  onPress?: () => void;
  replace?: boolean;
  navigateTo?: string;
} & Omit<PressableProps, 'onPress'>;

export default function BackButton({
  color,
  size = 24,
  onPress,
  replace = false,
  navigateTo,
  style,
  ...pressableProps
}: BackButtonProps) {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  
  const defaultColor = colorScheme === 'dark' ? '#fafafa' : '#18181b';
  const iconColor = color || defaultColor;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigateTo) {
      if (replace) {
        router.replace(navigateTo as any);
      } else {
        router.push(navigateTo as any);
      }
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        // Fallback if can't go back
        router.replace('/(tabs)' as any);
      }
    }
  };

  return (
    <Pressable
      style={({ pressed, hovered }) => [
        styles.button,
        pressed && styles.pressed,
        typeof style === 'function' ? style({ pressed, hovered }) : style,
      ]}
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      {...pressableProps}
    >
      <Icon as={ArrowLeft} size={size} color={iconColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  pressed: {
    opacity: 0.6,
  },
});
