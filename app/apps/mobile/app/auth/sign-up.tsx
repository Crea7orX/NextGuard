import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorMessage } from '@/components/ui/error-message';
import { Link } from 'expo-router';
import { View, Image, type ImageStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { AnotherMethodSeparator } from '@/components/auth/another-method-separator';
import { ContinueWithGoogle } from '@/components/auth/continue-with-google';
import { useState } from 'react';
import { KeyboardAvoidingScrollView } from '@/components/ui/keyboard-avoiding-scroll-view';

const LOGO = {
  light: require('@/assets/images/react-native-reusables-light.png'),
  dark: require('@/assets/images/react-native-reusables-dark.png'),
};

const IMAGE_STYLE: ImageStyle = {
  height: 80,
  width: 80,
};

export default function SignUpScreen() {
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = () => {
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    console.log('Sign up with:', { firstName, lastName, email, password });
    // TODO: Implement sign-up logic
  };

  return (
    <KeyboardAvoidingScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ 
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 16,
        flexGrow: 1,
      }}
    >
      <View className="flex-1 justify-center gap-8 px-6">
        {/* Logo Section */}
        <View className="items-center gap-4">
          <Image 
            source={LOGO[colorScheme ?? 'light']} 
            style={IMAGE_STYLE} 
            resizeMode="contain" 
          />
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold">Create account</Text>
            <Text className="text-muted-foreground text-center">
              Join NextGuard and secure your property
            </Text>
          </View>
        </View>

        {/* Sign Up Form */}
        <View className="gap-6 w-full max-w-md">
          <ContinueWithGoogle />

          <AnotherMethodSeparator />

          <View className="flex-row gap-4">
            <View className="gap-1 flex-1">
              <Label nativeID="firstName">First Name</Label>
              <Input
                placeholder="John"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                autoComplete="given-name"
              />
            </View>

            <View className="gap-1 flex-1">
              <Label nativeID="lastName">Last Name</Label>
              <Input
                placeholder="Doe"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                autoComplete="family-name"
              />
            </View>
          </View>

          <View className="gap-1">
            <Label nativeID="email">Email</Label>
            <Input
              placeholder="email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View className="gap-1">
            <Label nativeID="password">Password</Label>
            <Input
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
            />
            <Text className="text-xs text-muted-foreground">
              Must be at least 8 characters
            </Text>
          </View>

          <View className="gap-1">
            <Label nativeID="confirmPassword">Confirm Password</Label>
            <Input
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
            />
          </View>

          {error && <ErrorMessage message={error} />}

          <Button className="w-full" onPress={handleSignUp}>
            <Text>Create Account</Text>
          </Button>
        </View>

        {/* Sign In Link */}
        <View className="flex-row justify-center gap-1">
          <Text className="text-sm text-muted-foreground">
            Already have an account?
          </Text>
          <Link href="/auth/sign-in">
            <Text className="text-sm font-medium text-primary">Sign in</Text>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingScrollView>
  );
}
