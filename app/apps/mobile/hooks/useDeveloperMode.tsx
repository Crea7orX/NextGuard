import React, { useState, useEffect, createContext, useContext, ReactNode, ReactElement } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'NG_DEVELOPER_MODE';

interface DeveloperModeContextType {
  isDeveloperMode: boolean;
  isLoading: boolean;
  toggleDeveloperMode: () => Promise<void>;
  enableDeveloperMode: () => Promise<void>;
}

const DeveloperModeContext = createContext<DeveloperModeContextType | undefined>(undefined);

export function DeveloperModeProvider({ children }: { children: ReactNode }): ReactElement {
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (!mounted) return;
        setIsDeveloperMode(saved === 'true');
      } catch (e) {
        console.warn('Failed to load developer mode preference:', e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleDeveloperMode = async () => {
    const newValue = !isDeveloperMode;
    setIsDeveloperMode(newValue);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, String(newValue));
    } catch (e) {
      console.warn('Failed to save developer mode preference:', e);
    }
  };

  const enableDeveloperMode = async () => {
    setIsDeveloperMode(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {
      console.warn('Failed to enable developer mode:', e);
    }
  };

  return (
    <DeveloperModeContext.Provider
      value={{
        isDeveloperMode,
        isLoading,
        toggleDeveloperMode,
        enableDeveloperMode,
      }}
    >
      {children}
    </DeveloperModeContext.Provider>
  );
}

export function useDeveloperMode() {
  const context = useContext(DeveloperModeContext);
  if (context === undefined) {
    throw new Error('useDeveloperMode must be used within a DeveloperModeProvider');
  }
  return context;
}
