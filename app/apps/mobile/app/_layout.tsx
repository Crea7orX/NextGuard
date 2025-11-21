import "@/global.css";

import { NAV_THEME } from "@/lib/theme";
import { usePersistedTheme } from "@/hooks/usePersistedTheme";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { registerForPushNotificationsAsync } from "@/services/notifications";
import { DeveloperModeProvider } from "@/hooks/useDeveloperMode";
import { AuthProvider } from "@/providers/auth-provider";
import { BiometricLockProvider } from "@/providers/biometric-lock-provider";
import { LogBox } from 'react-native';

// Suppress warnings
LogBox.ignoreLogs([
  '[Reanimated] Writing to `value` during component render',
]);

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export default function RootLayout() {
  usePersistedTheme();

  const { colorScheme } = useColorScheme();

  useEffect(() => {
    // Register for push notifications on app start
    registerForPushNotificationsAsync();
  }, []);

  return (
    <AuthProvider>
      <BiometricLockProvider>
        <DeveloperModeProvider>
          <ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="auth" />
            </Stack>
            <PortalHost />
          </ThemeProvider>
        </DeveloperModeProvider>
      </BiometricLockProvider>
    </AuthProvider>
  );
}
