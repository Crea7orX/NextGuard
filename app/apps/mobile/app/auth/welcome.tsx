import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { View, ScrollView, Image, type ImageStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { Check } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

const LOGO = {
  light: require('@/assets/images/react-native-reusables-light.png'),
  dark: require('@/assets/images/react-native-reusables-dark.png'),
};

const IMAGE_STYLE: ImageStyle = {
  height: 120,
  width: 120,
};

export default function WelcomeScreen() {
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ 
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 16,
        flexGrow: 1,
      }}
    >
      <View className="flex-1 items-center justify-center gap-12 px-6">
        {/* Logo Section */}
        <View className="items-center gap-6">
          <Image 
            source={LOGO[colorScheme ?? 'light']} 
            style={IMAGE_STYLE} 
            resizeMode="contain" 
          />
          <View className="items-center gap-3">
            <Text className="text-4xl font-bold text-center">NextGuard</Text>
            <Text className="text-muted-foreground text-center text-lg max-w-sm">
              Secure your property... placeholder text ;)
            </Text>
          </View>
        </View>

        {/* Features List */}
        <View className="gap-4 w-full max-w-md">
          <View className="flex-row items-start gap-3">
            <View className="bg-primary rounded-full h-6 w-6 items-center justify-center">
              <Icon as={Check} className='text-primary-foreground size-4' />
            </View>
            <View className="flex-1">
              <Text className="font-semibold">Nqkvi polzi tam</Text>
              <Text className="text-muted-foreground text-sm">
                Track all your devices in real-time
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-start gap-3">
            <View className="bg-primary rounded-full h-6 w-6 items-center justify-center">
              <Icon as={Check} className='text-primary-foreground size-4' />
            </View>
            <View className="flex-1">
              <Text className="font-semibold">Enterprise-grade security</Text>
              <Text className="text-muted-foreground text-sm">
                Protect your data with advanced security features
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-start gap-3">
            <View className="bg-primary rounded-full h-6 w-6 items-center justify-center">
              <Icon as={Check} className='text-primary-foreground size-4' />
            </View>
            <View className="flex-1">
              <Text className="font-semibold">Bezopasnost</Text>
              <Text className="text-muted-foreground text-sm">
                Manage all devices from a single dashboard
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-4 w-full max-w-md">
          <Link href="/auth/sign-up" asChild>
            <Button className="w-full">
              <Text>Get Started</Text>
            </Button>
          </Link>
          
          <Link href="/auth/sign-in" asChild>
            <Button variant="outline" className="w-full">
              <Text>Sign In</Text>
            </Button>
          </Link>
        </View>

        {/* Terms & Privacy */}
        <View className="flex-row flex-wrap justify-center gap-1">
          <Text className="text-xs text-muted-foreground">
            By continuing, you agree to our
          </Text>
          <Text className="text-xs font-medium underline">Terms of Service</Text>
          <Text className="text-xs text-muted-foreground">and</Text>
          <Text className="text-xs font-medium underline">Privacy Policy</Text>
        </View>
      </View>
    </ScrollView>
  );
}
