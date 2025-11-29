import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { AppState, AppStateStatus, View, StyleSheet } from 'react-native';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { useBiometrics } from '@/hooks/useBiometrics';
import { useAuth } from '@/hooks/useAuth';

interface BiometricLockProviderProps {
  children: ReactNode;
}

/**
 * BiometricLockProvider
 * 
 * This provider manages biometric authentication requirement for the app.
 * It ensures that if biometric unlock is enabled:
 * 1. The app requires biometric authentication on launch
 * 2. The app requires biometric authentication when returning from background
 * 3. Users can only access the app after successful authentication
 * 
 * The provider wraps around the entire app and intercepts navigation
 * to show the biometric unlock screen when needed.
 */
export function BiometricLockProvider({ children }: BiometricLockProviderProps) {
  const { isEnabled, isLoading: biometricsLoading, capabilities } = useBiometrics();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const appState = useRef(AppState.currentState);
  
  // Track if biometric unlock is required
  const [requiresBiometricUnlock, setRequiresBiometricUnlock] = useState(false);
  
  // Track if we've checked on initial mount
  const hasCheckedInitial = useRef(false);

  // Check if we should require biometric unlock on mount
  useEffect(() => {
    if (biometricsLoading || authLoading || hasCheckedInitial.current) {
      return;
    }

    hasCheckedInitial.current = true;

    // If biometrics are enabled and user is authenticated, require unlock
    if (isEnabled && capabilities?.isAvailable && isAuthenticated) {
      setRequiresBiometricUnlock(true);
    }
  }, [isEnabled, capabilities, isAuthenticated, biometricsLoading, authLoading]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [isEnabled, capabilities, isAuthenticated]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    // When app comes back to foreground from background
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // If biometrics are enabled and user is authenticated, require unlock
      if (isEnabled && capabilities?.isAvailable && isAuthenticated) {
        setRequiresBiometricUnlock(true);
      }
    }

    appState.current = nextAppState;
  };

  // Navigate to biometric unlock screen when needed
  useEffect(() => {
    if (biometricsLoading || authLoading) {
      return;
    }

    const inAuthGroup = segments[0] === 'auth';
    const inBiometricUnlock = pathname === '/auth/biometric-unlock';

    // If biometric unlock is required and we're not already on that screen
    if (requiresBiometricUnlock && !inBiometricUnlock) {
      // Only navigate if user is authenticated
      if (isAuthenticated) {
        router.push('/auth/biometric-unlock');
      }
    }
  }, [
    requiresBiometricUnlock, 
    segments, 
    pathname, 
    isAuthenticated,
    biometricsLoading,
    authLoading,
  ]);

  // Handle successful biometric authentication
  const handleBiometricSuccess = () => {
    setRequiresBiometricUnlock(false);
  };

  // Provide context for biometric unlock screen
  return (
    <BiometricLockContext.Provider value={{ handleBiometricSuccess, requiresBiometricUnlock }}>
      {children}
    </BiometricLockContext.Provider>
  );
}

// Context for biometric lock state
interface BiometricLockContextValue {
  handleBiometricSuccess: () => void;
  requiresBiometricUnlock: boolean;
}

const BiometricLockContext = React.createContext<BiometricLockContextValue | undefined>(
  undefined
);

/**
 * Hook to access biometric lock context
 * Used by the biometric unlock screen to report successful authentication
 */
export function useBiometricLock() {
  const context = React.useContext(BiometricLockContext);
  if (context === undefined) {
    throw new Error('useBiometricLock must be used within a BiometricLockProvider');
  }
  return context;
}
