import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { saveToSecureStore, getFromSecureStore, deleteFromSecureStore } from '@/lib/utils';

const BIOMETRIC_ENABLED_KEY = 'NG_BIOMETRIC_ENABLED';

export interface BiometricCapabilities {
  isAvailable: boolean;
  isEnrolled: boolean;
  biometricType: 'fingerprint' | 'face' | 'iris' | 'none';
  supportedTypes: LocalAuthentication.AuthenticationType[];
}

export interface UseBiometricsReturn {
  isEnabled: boolean;
  isLoading: boolean;
  capabilities: BiometricCapabilities | null;
  enableBiometrics: () => Promise<boolean>;
  disableBiometrics: () => Promise<void>;
  authenticate: (reason?: string) => Promise<boolean>;
  checkCapabilities: () => Promise<BiometricCapabilities>;
}

/**
 * Custom hook to manage biometric authentication in the app
 * Handles Face ID, Touch ID, and Fingerprint authentication
 * 
 * @returns {UseBiometricsReturn} Biometric authentication state and methods
 * 
 * @example
 * ```tsx
 * function BiometricSettings() {
 *   const { isEnabled, capabilities, enableBiometrics, disableBiometrics } = useBiometrics();
 *   
 *   if (!capabilities?.isAvailable) {
 *     return <Text>Biometric authentication not available</Text>;
 *   }
 *   
 *   return (
 *     <Switch 
 *       value={isEnabled} 
 *       onValueChange={async (value) => {
 *         if (value) {
 *           await enableBiometrics();
 *         } else {
 *           await disableBiometrics();
 *         }
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export function useBiometrics(): UseBiometricsReturn {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [capabilities, setCapabilities] = useState<BiometricCapabilities | null>(null);

  /**
   * Check device biometric capabilities
   */
  const checkCapabilities = async (): Promise<BiometricCapabilities> => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      let biometricType: BiometricCapabilities['biometricType'] = 'none';
      
      if (supportedTypes.length > 0) {
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          biometricType = 'face';
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          biometricType = 'fingerprint';
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
          biometricType = 'iris';
        }
      }

      return {
        isAvailable: compatible && enrolled,
        isEnrolled: enrolled,
        biometricType,
        supportedTypes,
      };
    } catch (error) {
      console.error('Error checking biometric capabilities:', error);
      return {
        isAvailable: false,
        isEnrolled: false,
        biometricType: 'none',
        supportedTypes: [],
      };
    }
  };

  /**
   * Load saved biometric preference and check capabilities on mount
   */
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      setIsLoading(true);
      try {
        // Check device capabilities
        const caps = await checkCapabilities();
        if (mounted) {
          setCapabilities(caps);
        }

        // Load saved preference
        const savedPreference = await getFromSecureStore(BIOMETRIC_ENABLED_KEY);
        if (mounted) {
          // Only enable if device supports biometrics and user had it enabled
          setIsEnabled(savedPreference === 'true' && caps.isAvailable);
        }
      } catch (error) {
        console.error('Error initializing biometrics:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Enable biometric authentication
   * Prompts user to authenticate before enabling
   */
  const enableBiometrics = async (): Promise<boolean> => {
    try {
      // Check if biometrics are available
      const caps = await checkCapabilities();
      
      if (!caps.isAvailable) {
        console.warn('Biometric authentication not available on this device');
        return false;
      }

      // Prompt user to authenticate
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric unlock',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        await saveToSecureStore(BIOMETRIC_ENABLED_KEY, 'true');
        setIsEnabled(true);
        return true;
      } else {
        console.warn('Biometric authentication failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error enabling biometrics:', error);
      return false;
    }
  };

  /**
   * Disable biometric authentication
   */
  const disableBiometrics = async (): Promise<void> => {
    try {
      await deleteFromSecureStore(BIOMETRIC_ENABLED_KEY);
      setIsEnabled(false);
    } catch (error) {
      console.error('Error disabling biometrics:', error);
    }
  };

  /**
   * Authenticate user with biometrics
   * @param reason - Optional custom message to show during authentication
   */
  const authenticate = async (reason?: string): Promise<boolean> => {
    try {
      if (!isEnabled || !capabilities?.isAvailable) {
        console.warn('Biometric authentication is not enabled or available');
        return false;
      }

      const defaultMessage = Platform.select({
        ios: capabilities.biometricType === 'face' 
          ? 'Authenticate with Face ID' 
          : 'Authenticate with Touch ID',
        android: capabilities.biometricType === 'face'
          ? 'Authenticate with Face Recognition'
          : 'Authenticate with Fingerprint',
        default: 'Authenticate to unlock',
      });

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason || defaultMessage,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use passcode',
      });

      return result.success;
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      return false;
    }
  };

  return {
    isEnabled,
    isLoading,
    capabilities,
    enableBiometrics,
    disableBiometrics,
    authenticate,
    checkCapabilities,
  };
}
