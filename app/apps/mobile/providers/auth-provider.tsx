import * as React from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSegments } from "expo-router";
import type { AuthProviderProps, AuthContextValue } from "@/types/auth";

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined
);

/**
 * Hook to access authentication context
 * Must be used within an AuthProvider
 * 
 * @returns Authentication state including isAuthenticated, isLoading, and user
 * @throws Error if used outside of AuthProvider
 */
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Auth Provider component that wraps the app with authentication context
 * 
 * Note: React Query is provided by better-auth's createAuthClient
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, isPending, error } = authClient.useSession();
  const router = useRouter();
  const segments = useSegments();

  const isAuthenticated = !!session?.session && !error;
  const isLoading = isPending;

  // Navigation protection based on auth state
  React.useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "auth";
    const inTabsGroup = segments[0] === "(tabs)";

    if (!isAuthenticated && inTabsGroup) {
      // Redirect to sign in if trying to access protected routes
      router.replace("/auth/welcome");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated user tries to access auth pages
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, isLoading]);

  const contextValue: AuthContextValue = {
    isAuthenticated,
    isLoading,
    user: session?.user ?? null,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
