import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Sun, Moon, Monitor } from 'lucide-react-native';

const STORAGE_KEY = 'NG_THEME_PREFERENCE';

type ThemeOption = 'light' | 'dark' | 'system';

type Props = {
  label?: string;
};

export default function ThemeSwitch({ label = 'Appearance' }: Props) {
  const { colorScheme, setColorScheme } = useColorScheme() as {
    colorScheme?: 'light' | 'dark';
    setColorScheme?: (s: 'light' | 'dark' | 'system') => void;
  };

  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>('system');

  // Load persisted preference and apply on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const AsyncStorage = require('@react-native-async-storage/async-storage');
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (!mounted) return;
        if (saved === 'dark' || saved === 'light' || saved === 'system') {
          setSelectedTheme(saved);
          setColorScheme?.(saved);
        }
      } catch (e) {
        // If AsyncStorage isn't available, silently skip persistence
      }
    })();
    return () => {
      mounted = false;
    };
  }, [setColorScheme]);

  const handleThemeChange = async (theme: ThemeOption) => {
    setSelectedTheme(theme);
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      await AsyncStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // ignore if AsyncStorage not installed
    }
    setColorScheme?.(theme);
  };

  const iconSize = 20;
  const currentScheme = colorScheme ?? 'light';
  const iconColor = currentScheme === 'dark' ? '#fafafa' : '#18181b';

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: iconColor }]}>{label}</Text>
      <View style={styles.optionsRow}>
        <Pressable
          style={[
            styles.option,
            selectedTheme === 'light' && styles.optionSelected,
            { borderColor: currentScheme === 'dark' ? '#3f3f46' : '#e4e4e7' },
            selectedTheme === 'light' && {
              borderColor: currentScheme === 'dark' ? '#fafafa' : '#18181b',
            },
          ]}
          onPress={() => handleThemeChange('light')}
        >
          <Sun
            size={iconSize}
            color={selectedTheme === 'light' ? iconColor : '#a1a1aa'}
          />
          <Text
            style={[
              styles.optionText,
              { color: selectedTheme === 'light' ? iconColor : '#a1a1aa' },
            ]}
          >
            Light
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.option,
            selectedTheme === 'dark' && styles.optionSelected,
            { borderColor: currentScheme === 'dark' ? '#3f3f46' : '#e4e4e7' },
            selectedTheme === 'dark' && {
              borderColor: currentScheme === 'dark' ? '#fafafa' : '#18181b',
            },
          ]}
          onPress={() => handleThemeChange('dark')}
        >
          <Moon
            size={iconSize}
            color={selectedTheme === 'dark' ? iconColor : '#a1a1aa'}
          />
          <Text
            style={[
              styles.optionText,
              { color: selectedTheme === 'dark' ? iconColor : '#a1a1aa' },
            ]}
          >
            Dark
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.option,
            selectedTheme === 'system' && styles.optionSelected,
            { borderColor: currentScheme === 'dark' ? '#3f3f46' : '#e4e4e7' },
            selectedTheme === 'system' && {
              borderColor: currentScheme === 'dark' ? '#fafafa' : '#18181b',
            },
          ]}
          onPress={() => handleThemeChange('system')}
        >
          <Monitor
            size={iconSize}
            color={selectedTheme === 'system' ? iconColor : '#a1a1aa'}
          />
          <Text
            style={[
              styles.optionText,
              { color: selectedTheme === 'system' ? iconColor : '#a1a1aa' },
            ]}
          >
            System
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  option: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  optionSelected: {
    borderWidth: 2,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
