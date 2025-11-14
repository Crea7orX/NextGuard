import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Fingerprint, Scan } from 'lucide-react-native';
import { useBiometrics } from '@/hooks/useBiometrics';
import { Switch } from '@/components/ui/switch';

type Props = {
  label?: string;
  className?: string;
};

export default function BiometricSwitch({ label = 'Biometric Unlock', className }: Props) {
  const { colorScheme } = useColorScheme() as {
    colorScheme?: 'light' | 'dark';
  };
  
  const { 
    isEnabled, 
    isLoading, 
    capabilities, 
    enableBiometrics, 
    disableBiometrics 
  } = useBiometrics();

  const [isToggling, setIsToggling] = useState(false);

  const currentScheme = colorScheme ?? 'light';
  const iconColor = currentScheme === 'dark' ? '#fafafa' : '#18181b';
  const mutedColor = currentScheme === 'dark' ? '#a1a1aa' : '#71717a';

  const getBiometricLabel = () => {
    if (!capabilities) return 'Biometric Unlock';
    
    switch (capabilities.biometricType) {
      case 'face':
        return 'Face ID';
      case 'fingerprint':
        return 'Fingerprint';
      case 'iris':
        return 'Iris Recognition';
      default:
        return 'Biometric Unlock';
    }
  };

  const getBiometricDescription = () => {
    if (!capabilities?.isAvailable) {
      if (!capabilities?.isEnrolled) {
        return 'No biometric data enrolled on this device';
      }
      return 'Biometric authentication not available';
    }
    
    return `Use ${getBiometricLabel().toLowerCase()} to unlock the app`;
  };

  const handleToggle = async (value: boolean) => {
    setIsToggling(true);
    try {
      if (value) {
        const success = await enableBiometrics();
        if (!success) {
          Alert.alert(
            'Authentication Failed',
            'Could not enable biometric unlock. Please try again.',
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert(
          'Disable Biometric Unlock',
          'Are you sure you want to disable biometric unlock?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Disable',
              style: 'destructive',
              onPress: async () => {
                await disableBiometrics();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error toggling biometrics:', error);
      Alert.alert(
        'Error',
        'An error occurred while changing biometric settings.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsToggling(false);
    }
  };

  const Icon = capabilities?.biometricType === 'face' ? Scan : Fingerprint;

  if (isLoading) {
    return (
      <View style={[styles.container, { opacity: 0.5 }]} className={className}>
        <View style={styles.iconContainer}>
          <ActivityIndicator size="small" color={mutedColor} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.label, { color: iconColor }]}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Don't render if biometrics are not available
  if (!capabilities?.isAvailable) {
    return null;
  }

  return (
    <View style={styles.container} className={className}>
      <View style={styles.iconContainer}>
        <Icon size={20} color={iconColor} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.label, { color: iconColor }]}>
          {getBiometricLabel()}
        </Text>
        <Text style={[styles.description, { color: mutedColor }]}>
          {getBiometricDescription()}
        </Text>
      </View>
      <View style={styles.switchContainer}>
        {isToggling ? (
          <ActivityIndicator size="small" color={iconColor} />
        ) : (
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={isToggling}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  switchContainer: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
});
