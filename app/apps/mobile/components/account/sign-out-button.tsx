import { Alert } from 'react-native';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { LogOut } from 'lucide-react-native';
import { authClient } from '@/lib/auth-client';

interface SignOutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' ;
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
          className={variant !== 'default' ? 'text-primary' : "text-primary-foreground"}
        />
      )}
      <Text className={variant !== 'default' ? 'text-primary' : undefined}>
        {isSigningOut ? loadingText : text}
      </Text>
    </Button>
  );
}
