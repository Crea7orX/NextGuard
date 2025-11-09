import { Alert } from 'react-native';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { LogOut } from 'lucide-react-native';
import { authClient } from '@/lib/auth-client';

interface SignOutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationMessage?: string;
  showIcon?: boolean;
  text?: string;
  loadingText?: string;
  onSignOutStart?: () => void;
  onSignOutSuccess?: () => void;
  onSignOutError?: (error: unknown) => void;
}

/**
 * Sign Out Button Component
 * 
 * A reusable button component that handles user sign-out with optional confirmation dialog.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <SignOutButton />
 * 
 * // Custom styling
 * <SignOutButton variant="outline" className="w-full" />
 * 
 * // Without confirmation
 * <SignOutButton showConfirmation={false} />
 * 
 * // Custom text
 * <SignOutButton text="Logout" loadingText="Logging out..." />
 * 
 * // With callbacks
 * <SignOutButton
 *   onSignOutStart={() => console.log('Starting...')}
 *   onSignOutSuccess={() => console.log('Success!')}
 *   onSignOutError={(error) => console.error(error)}
 * />
 * ```
 */
export function SignOutButton({
  variant = 'destructive',
  size = 'default',
  className,
  showConfirmation = true,
  confirmationTitle = 'Sign Out',
  confirmationMessage = 'Are you sure you want to sign out?',
  showIcon = true,
  text = 'Sign Out',
  loadingText = 'Signing Out...',
  onSignOutStart,
  onSignOutSuccess,
  onSignOutError,
}: SignOutButtonProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const performSignOut = async () => {
    setIsSigningOut(true);
    
    try {
      onSignOutStart?.();
      await authClient.signOut();
      onSignOutSuccess?.();
      // Navigation is handled automatically by AuthProvider
    } catch (error) {
      console.error('Error signing out:', error);
      onSignOutError?.(error);
      
      Alert.alert(
        'Error',
        'Failed to sign out. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleSignOut = () => {
    if (showConfirmation) {
      Alert.alert(
        confirmationTitle,
        confirmationMessage,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: performSignOut,
          },
        ]
      );
    } else {
      performSignOut();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onPress={handleSignOut}
      disabled={isSigningOut}
      className={className}
    >
      {showIcon && (
        <Icon 
          as={LogOut} 
          className={variant === 'destructive' ? 'text-destructive-foreground' : undefined}
        />
      )}
      <Text className={variant === 'destructive' ? 'text-destructive-foreground' : undefined}>
        {isSigningOut ? loadingText : text}
      </Text>
    </Button>
  );
}
