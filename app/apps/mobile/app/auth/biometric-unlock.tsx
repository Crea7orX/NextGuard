import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Fingerprint, Scan, Lock } from 'lucide-react-native';
import { useBiometrics } from '@/hooks/useBiometrics';
import { useBiometricLock } from '@/providers/biometric-lock-provider';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';

/**
 * BiometricUnlockScreen component
 * 
 * This is an example component that demonstrates how to implement
 * a biometric unlock screen when the app is launched.
 * 
 * Usage:
 * You can add this screen to your auth flow or app startup to require
 * biometric authentication before accessing the app.
 * 
 * To use this in your app:
 * 1. Add this screen to your router
 * 2. Check if biometrics are enabled in your AuthProvider or _layout.tsx
 * 3. Navigate to this screen if biometrics are enabled
 * 
 * @example
 * ```tsx
 * // In your AuthProvider or app layout:
 * const { isEnabled, authenticate } = useBiometrics();
 * 
 * useEffect(() => {
 *   if (isEnabled) {
 *     // Navigate to biometric unlock screen
 *     router.push('/auth/biometric-unlock');
 *   }
 * }, [isEnabled]);
 * ```
 */
export default function BiometricUnlockScreen() {
  const { colorScheme } = useColorScheme();
  const { isEnabled, capabilities, authenticate } = useBiometrics();
  const { handleBiometricSuccess } = useBiometricLock();
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const currentScheme = colorScheme ?? 'light';
  const iconColor = currentScheme === 'dark' ? '#fafafa' : '#18181b';
  const mutedColor = currentScheme === 'dark' ? '#a1a1aa' : '#71717a';

  useEffect(() => {
    // Auto-trigger biometric authentication when the screen loads
    if (isEnabled && capabilities?.isAvailable) {
      handleBiometricAuth();
    } else {
      // If biometrics are disabled or not available, unlock immediately
      handleBiometricSuccess();
      router.replace('/(tabs)');
    }
  }, []);

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    try {
      const success = await authenticate('Authenticate to access NextGuard');
      
      if (success) {
        // Notify the provider that authentication was successful
        handleBiometricSuccess();
        // Navigate to the main app
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Authentication Failed',
          'Could not verify your identity. Please try again.',
          [{ text: 'Try Again', onPress: handleBiometricAuth }]
        );
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert(
        'Error',
        'An error occurred during authentication.',
        [{ text: 'Try Again', onPress: handleBiometricAuth }]
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const Icon = capabilities?.biometricType === 'face' ? Scan : Fingerprint;
  const biometricLabel = capabilities?.biometricType === 'face' ? 'Face ID' : 'Fingerprint';

  return (
    <View style={[styles.container, { backgroundColor: currentScheme === 'dark' ? '#09090b' : '#ffffff' }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: currentScheme === 'dark' ? '#18181b' : '#f4f4f5' }]}>
          <Lock size={48} color={iconColor} />
        </View>
        
        <Text style={[styles.title, { color: iconColor }]}>
          NextGuard is Locked
        </Text>
        
        <Text style={[styles.description, { color: mutedColor }]}>
          Use {biometricLabel} to unlock and access your account
        </Text>

        <View style={styles.biometricIcon}>
          <Icon size={80} color={mutedColor} />
        </View>

        <Button
          onPress={handleBiometricAuth}
          disabled={isAuthenticating}
          className="w-full max-w-xs"
        >
          <Text>
            {isAuthenticating ? 'Authenticating...' : `Unlock with ${biometricLabel}`}
          </Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  biometricIcon: {
    marginVertical: 32,
  },
});
