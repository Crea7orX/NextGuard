/**
 * Type definitions for the Auth Provider
 */

/**
 * Authentication context value returned by useAuth hook
 */
export interface AuthContextValue {
  /**
   * Whether the user is currently authenticated
   */
  isAuthenticated: boolean;
  
  /**
   * Whether authentication state is being loaded
   */
  isLoading: boolean;
  
  /**
   * The authenticated user object, or null if not authenticated
   */
  user: User | null;
}

/**
 * User object structure from better-auth
 */
export interface User {
  /**
   * Unique user identifier
   */
  id: string;
  
  /**
   * User's email address
   */
  email: string;
  
  /**
   * User's display name
   */
  name: string;
  
  /**
   * User's profile image URL (optional)
   */
  image?: string | null;
  
  /**
   * Whether the user's email has been verified
   */
  emailVerified: boolean;
  
  /**
   * Timestamp when the user was created
   */
  createdAt: Date;
  
  /**
   * Timestamp when the user was last updated
   */
  updatedAt: Date;
}

/**
 * Session object structure from better-auth
 */
export interface Session {
  /**
   * Unique session identifier
   */
  id: string;
  
  /**
   * User ID associated with this session
   */
  userId: string;
  
  /**
   * When the session expires
   */
  expiresAt: Date;
  
  /**
   * Session token
   */
  token: string;
  
  /**
   * IP address of the session
   */
  ipAddress?: string | null;
  
  /**
   * User agent string
   */
  userAgent?: string | null;
  
  /**
   * Active organization ID (if using organizations)
   */
  activeOrganizationId?: string | null;
  
  /**
   * Timestamp when the session was created
   */
  createdAt: Date;
  
  /**
   * Timestamp when the session was last updated
   */
  updatedAt: Date;
}

/**
 * Full session data from better-auth
 */
export interface SessionData {
  /**
   * User data
   */
  user: User;
  
  /**
   * Session data
   */
  session: Session;
}

/**
 * Auth provider component props
 */
export interface AuthProviderProps {
  /**
   * Child components to wrap with auth context
   */
  children: React.ReactNode;
}

/**
 * Sign in with email credentials
 */
export interface SignInCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Sign up with email credentials
 */
export interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
}

/**
 * Auth operation callbacks
 */
export interface AuthCallbacks<T = void> {
  /**
   * Called when the operation starts
   */
  onRequest?: () => void;
  
  /**
   * Called when the operation succeeds
   */
  onSuccess?: (data: T) => void;
  
  /**
   * Called when the operation fails
   */
  onError?: (error: AuthError) => void;
}

/**
 * Auth error structure
 */
export interface AuthError {
  /**
   * Error code
   */
  code: string;
  
  /**
   * Human-readable error message
   */
  message: string;
  
  /**
   * HTTP status code (if applicable)
   */
  status?: number;
}
