import { useAuth as useAuthContext } from "@/providers/auth-provider";

/**
 * Custom hook to access authentication state
 * 
 * @returns {Object} Authentication state
 * @returns {boolean} isAuthenticated - Whether the user is authenticated
 * @returns {boolean} isLoading - Whether authentication is loading
 * @returns {any | null} user - The authenticated user object or null
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isAuthenticated, isLoading, user } = useAuth();
 *   
 *   if (isLoading) {
 *     return <LoadingSpinner />;
 *   }
 *   
 *   if (!isAuthenticated) {
 *     return <Text>Please sign in</Text>;
 *   }
 *   
 *   return <Text>Welcome, {user.name}!</Text>;
 * }
 * ```
 */
export function useAuth() {
  return useAuthContext();
}
