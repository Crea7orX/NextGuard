import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { AnotherMethodSeparator } from '@/components/auth/another-method-separator';
import { ContinueWithGoogleButton } from '@/components/auth/continue-with-google-button';
import { authClient } from '@/lib/auth-client';
import { env } from '@/env';
import { useCountdown } from '@/hooks/useCountdown';
import React from 'react';

export default function VerifyEmailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();

  const initialRequest = React.useRef(true);
  React.useEffect(() => {
    if (!email) {
      router.replace('/auth/sign-in');
      return;
    }
    if (!initialRequest.current) return;
    initialRequest.current = false;
    requestVerifyEmail();
  }, []);

  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingProvider, setIsLoadingProvider] = React.useState(false);
  const [message, setMessage] = React.useState<{ text: string; type: 'success' | 'error' }>();
  const disabled = isInitialLoading || isLoading || isLoadingProvider;

  const [count, { startCountdown, resetCountdown }, isCountdownRunning] =
    useCountdown({
      countStart: 30,
      intervalMs: 1000,
    });

  function requestVerifyEmail() {
    if (!email) return;

    void authClient.sendVerificationEmail(
      {
        email,
        callbackURL: `${env.EXPO_PUBLIC_BETTER_AUTH_URL}/verify-email/token`,
      },
      {
        onRequest: () => {
          setIsLoading(true);
          setMessage(undefined);
        },
        onResponse: () => {
          setIsInitialLoading(false);
          setIsLoading(false);
          resetCountdown();
          startCountdown();
        },
        onSuccess: () => {
          setMessage({
            text: `We've sent an email to ${email}. Follow the link to verify your email address.`,
            type: 'success',
          });
        },
        onError: (ctx) => {
          setMessage({ text: ctx.error.message, type: 'error' });
        },
      },
    );
  }

  const handleResendEmail = () => {
    requestVerifyEmail();
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ 
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 16,
        flexGrow: 1,
        justifyContent: 'center'
      }}
    >
      <View className="w-full max-w-md mx-auto">
        {/* Logo/Brand Section */}
        <View className="mb-8 items-center">
          <Text className="text-3xl font-bold">NextGuard</Text>
          <Text className="text-muted-foreground mt-2">Secure your devices</Text>
        </View>

        {/* Verify Email Card */}
        <Card>
          <CardHeader className="text-center">
            <View className="bg-primary/10 rounded-full h-16 w-16 items-center justify-center mx-auto mb-4">
              <Icon as={Mail} className='text-primary size-8' />
            </View>
            <CardTitle className="text-xl text-center">Check your email</CardTitle>
            <CardDescription className="text-center">
              We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <View className="gap-6">
              {/* Message Display */}
              {message && (
                <View className={`rounded-lg p-4 ${message.type === 'success' ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                  <Text className={`text-sm text-center ${message.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                    {message.text}
                  </Text>
                </View>
              )}

              {/* Email Sent Info */}
              <View className="bg-muted rounded-lg p-4">
                <Text className="text-sm font-medium text-center">
                  {email || 'your email'}
                </Text>
              </View>

              {/* Resend Button */}
              {isInitialLoading ? (
                <View className="h-10 items-center justify-center">
                  <ActivityIndicator size="large" />
                </View>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onPress={handleResendEmail}
                  disabled={disabled || isCountdownRunning}
                >
                  {isLoading ? (
                    <View className="flex-row items-center gap-2">
                      <ActivityIndicator size="small" />
                      <Text>Sending...</Text>
                    </View>
                  ) : isCountdownRunning ? (
                    <Text>Resend after {count}s</Text>
                  ) : (
                    <Text>Resend Verification Email</Text>
                  )}
                </Button>
              )}

              {/* Alternative Sign In Methods */}
              <View className="gap-6">
                <AnotherMethodSeparator text='Or use another method' />
                <ContinueWithGoogleButton
                  // TODO
                  disabled={disabled}
                  setIsLoadingProvider={setIsLoadingProvider}
                />
              </View>

              {/* Help Text */}
              <View className="gap-2">
                <Text className="text-sm text-muted-foreground text-center">
                  Didn't receive the email? Check your spam folder.
                </Text>
              </View>

              {/* Back to Sign In Link */}
              <View className="flex-row justify-center gap-1">
                <Text className="text-sm text-muted-foreground">
                  Wrong email?{' '}
                </Text>
                <Link href="/auth/sign-in" asChild>
                  <Text className="text-sm font-semibold text-primary">Go back</Text>
                </Link>
              </View>
            </View>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}
