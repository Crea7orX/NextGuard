import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';

type Props = {
  label?: string;
};

export default function DeveloperModeToggle({ label = 'Developer Mode' }: Props) {
  const { colorScheme } = useColorScheme();
  const { isDeveloperMode, toggleDeveloperMode } = useDeveloperMode();

  const textColor = colorScheme === 'dark' ? '#fafafa' : '#18181b';

  return (
    <View style={styles.container}>
      <Label nativeID="developer-mode" style={[styles.label, { color: textColor }]}>
        {label}
      </Label>
      <Switch
        checked={isDeveloperMode}
        onCheckedChange={toggleDeveloperMode}
        nativeID="developer-mode"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
