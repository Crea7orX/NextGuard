import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useLocalSearchParams } from 'expo-router';
import { View, Image, type ImageStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { KeyRound } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import { KeyboardAvoidingScrollView } from '@/components/ui/keyboard-avoiding-scroll-view';

const LOGO = {
  light: require('@/assets/images/logo-black.png'),
  dark: require('@/assets/images/logo-white.png'),
};

const IMAGE_STYLE: ImageStyle = {
  height: 80,
  width: 80,
};

export default function ForgotPasswordScreen() {
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleResetPassword = () => {
    console.log('Reset password for:', email);
    // TODO: Implement password reset logic
  };

  return (
    <KeyboardAvoidingScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ 
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 16,
        flexGrow: 1,
        justifyContent: 'center'
      }}
    >
      <View className="w-full max-w-md mx-auto gap-8">
        {/* Logo Section */}
        <View className="items-center gap-4">
          <Image 
            source={LOGO[colorScheme ?? 'light']} 
            style={IMAGE_STYLE} 
            resizeMode="contain" 
          />
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold">Reset Password</Text>
            <Text className="text-muted-foreground text-center">
              Enter your email to receive a password reset link
            </Text>
          </View>
        </View>

        {/* Reset Password Card */}
        <Card>
          <CardHeader className="text-center">
            <View className="bg-primary/10 rounded-full h-16 w-16 items-center justify-center mx-auto mb-4">
              <Icon as={KeyRound} className='text-primary size-8' />
            </View>
            <CardTitle className="text-xl text-center">Forgot your password?</CardTitle>
            <CardDescription className="text-center">
              No worries! We'll send you reset instructions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <View className="gap-6">
              {/* Email Input */}
              <View className="gap-1">
                <Label nativeID="email">Email</Label>
                <Input
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              {/* Reset Button */}
              <Button className="w-full" onPress={handleResetPassword}>
                <Text>Send Reset Link</Text>
              </Button>

              {/* Back to Sign In Link */}
              <View className="flex-row justify-center gap-1">
                <Text className="text-sm text-muted-foreground">
                  Remembered your password?
                </Text>
                <Link href="/auth/sign-in" asChild>
                  <Text className="text-sm font-medium text-center">
                    Back to Sign In
                  </Text>
                </Link>
              </View>
            </View>
          </CardContent>
        </Card>
      </View>
    </KeyboardAvoidingScrollView>
  );
}
