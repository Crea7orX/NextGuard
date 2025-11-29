import { Text } from '@/components/ui/text';
import { ActivityIndicator, Pressable, View } from 'react-native';
import GoogleIcon from '@/assets/icons/google.svg';
import { Icon } from '@/components/ui/icon';
import { authClient } from '@/lib/auth-client';
import React from 'react';

interface ContinueWithGoogleProps {
  redirectUrl?: string;
  disabled?: boolean;
  setIsLoadingProvider?: React.Dispatch<React.SetStateAction<boolean>>;
  setMessage?: React.Dispatch<React.SetStateAction<string | undefined>>;
  onPress?: () => void;
}

export function ContinueWithGoogleButton({ 
  redirectUrl = "/dashboard",
  disabled,
  setIsLoadingProvider,
  setMessage,
  onPress 
}: ContinueWithGoogleProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const isLastMethod = authClient.isLastUsedLoginMethod("google");

  const handleGoogleSignIn = () => {
    void authClient.signIn.social(
      {
        provider: "google",
        callbackURL: redirectUrl,
      },
      {
        onRequest: () => {
          setIsLoading(true);
          setIsLoadingProvider?.(true);
          setMessage?.(undefined);
          console.log('Starting Google sign-in...');
        },
        onError: (ctx) => {
          setIsLoading(false);
          setIsLoadingProvider?.(false);
          setMessage?.(ctx.error.message);
          console.error('Google sign-in error:', ctx.error.message);
        },
        onSuccess: () => {
          setIsLoading(false);
          setIsLoadingProvider?.(false);
          console.log('Google sign-in successful');
          onPress?.();
        },
      },
    );
  };

  return (
    <Pressable
      className="flex-row items-center justify-center gap-1 rounded-lg border border-border bg-card px-4 py-3 active:opacity-80 disabled:opacity-50"
      onPress={handleGoogleSignIn}
      disabled={disabled || isLoading}
    >
      <View className="h-5 w-5 items-center justify-center">
        {isLoading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Icon as={GoogleIcon} className='text-primary' width={16} height={16} />
        )}
      </View>
      <Text className="text-base font-semibold">Continue with Google</Text>
      {isLastMethod && (
        <View className="absolute -top-2 -right-2 rounded-full bg-primary px-2 py-0.5">
          <Text className="text-xs font-medium text-primary-foreground">Last</Text>
        </View>
      )}
    </Pressable>
  );
}
