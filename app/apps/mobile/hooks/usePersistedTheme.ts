import { useEffect } from 'react';
import { useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'NG_THEME_PREFERENCE';

export function usePersistedTheme() {
  const { setColorScheme } = useColorScheme() as {
    setColorScheme?: (s: 'light' | 'dark' | 'system') => void;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (!mounted) return;
        if (saved === 'dark' || saved === 'light' || saved === 'system') {
          setColorScheme?.(saved);
        }
      } catch (e) {
        console.warn('Failed to load theme preference:', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [setColorScheme]);
}
