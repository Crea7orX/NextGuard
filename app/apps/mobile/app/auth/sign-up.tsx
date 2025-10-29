import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignUpScreen() {
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

          {/* Sign Up Card */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-center">Create your account</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="gap-6">
                {/* Google Sign Up Button */}
                <Button variant="outline" className="w-full">
                  <Text>Continue with Google</Text>
                </Button>

                {/* Separator */}
                <View className="flex-row items-center gap-4">
                  <Separator className="flex-1" />
                  <Text className="text-muted-foreground text-sm">Or continue with</Text>
                  <Separator className="flex-1" />
                </View>

                {/* Form Fields */}
                <View className="gap-4">
                  {/* Name Fields */}
                  <View className="flex-row gap-3">
                    <View className="flex-1 gap-1">
                      <Text className="text-sm font-medium">First Name</Text>
                      <Input
                        placeholder="John"
                        autoCapitalize="words"
                        autoComplete="name-given"
                      />
                    </View>
                    <View className="flex-1 gap-1">
                      <Text className="text-sm font-medium">Last Name</Text>
                      <Input
                        placeholder="Doe"
                        autoCapitalize="words"
                        autoComplete="name-family"
                      />
                    </View>
                  </View>

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

                  {/* Password Field */}
                  <View className="gap-1">
                    <Text className="text-sm font-medium">Password</Text>
                    <Input
                      placeholder="Enter your password"
                      secureTextEntry
                      autoCapitalize="none"
                      autoComplete="password-new"
                    />
                  </View>

                  {/* Confirm Password Field */}
                  <View className="gap-1">
                    <Text className="text-sm font-medium">Confirm Password</Text>
                    <Input
                      placeholder="Confirm your password"
                      secureTextEntry
                      autoCapitalize="none"
                      autoComplete="password-new"
                    />
                  </View>
                </View>

                {/* Sign Up Button */}
                <Button className="w-full">
                  <Text>Sign Up</Text>
                </Button>

                {/* Sign In Link */}
                <View className="flex-row justify-center gap-1">
                  <Text className="text-sm text-muted-foreground">
                    Have an account?{' '}
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
