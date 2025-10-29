import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail } from 'lucide-react-native';

export default function VerifyEmailScreen() {
  const insets = useSafeAreaInsets();

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
              <Mail size={32} color="#fff" />
            </View>
            <CardTitle className="text-xl text-center">Check your email</CardTitle>
            <CardDescription className="text-center">
              We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <View className="gap-6">
              {/* Email Sent Info */}
              <View className="bg-muted rounded-lg p-4">
                <Text className="text-sm font-medium text-center">
                  example@email.com
                </Text>
              </View>

              {/* Resend Button */}
              <Button variant="outline" className="w-full">
                <Text>Resend Verification Email</Text>
              </Button>

              {/* Alternative Sign In Methods */}
              <View className="gap-4">
                <View className="flex-row items-center gap-4">
                  <View className="flex-1 h-[1px] bg-border" />
                  <Text className="text-muted-foreground text-sm">Or continue with</Text>
                  <View className="flex-1 h-[1px] bg-border" />
                </View>

                <Button variant="outline" className="w-full">
                  <Text>Continue with Google</Text>
                </Button>
              </View>

              {/* Help Text */}
              <View className="gap-2">
                <Text className="text-sm text-muted-foreground text-center">
                  Didn't receive the email? Check your spam folder or
                </Text>
                <Text className="text-sm font-medium text-center underline">
                  contact support
                </Text>
              </View>

              {/* Back to Sign In Link */}
              <View className="flex-row justify-center gap-1">
                <Text className="text-sm text-muted-foreground">
                  Wrong email?{' '}
                </Text>
                <Link href="/auth/sign-in" asChild>
                  <Text className="text-sm font-medium underline">Go back</Text>
                </Link>
              </View>
            </View>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}
