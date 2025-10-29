import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
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

          {/* Forgot Password Card */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-center">Reset Password</CardTitle>
              <CardDescription className="text-center">
                Enter your email address and we'll send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <View className="gap-6">
                {/* Email Field */}
                <View className="gap-1">
                  <Text className="text-sm font-medium">Email</Text>
                  <Input
                    placeholder="Enter your email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>

                {/* Send Reset Link Button */}
                <Button className="w-full">
                  <Text>Send Reset Link</Text>
                </Button>

                {/* Back to Sign In Link */}
                <View className="flex-row justify-center gap-1">
                  <Text className="text-sm text-muted-foreground">
                    Remember your password?{' '}
                  </Text>
                  <Link href="/auth/sign-in" asChild>
                    <Text className="text-sm font-medium underline">Sign in</Text>
                  </Link>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
