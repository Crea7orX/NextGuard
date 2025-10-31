import { useColorScheme } from 'nativewind';

export function useThemeColor() {
  const { colorScheme } = useColorScheme();
  
  // Fallback colors matching NativeWind's default theme
  const colors = {
    foreground: colorScheme === 'dark' ? '#fafafa' : '#09090b',
    background: colorScheme === 'dark' ? '#09090b' : '#ffffff',
    primary: colorScheme === 'dark' ? '#fafafa' : '#18181b',
    muted: colorScheme === 'dark' ? '#27272a' : '#f4f4f5',
    destructive: colorScheme === 'dark' ? '#ef4444' : '#dc2626',
  };
  
  return colors;
}
