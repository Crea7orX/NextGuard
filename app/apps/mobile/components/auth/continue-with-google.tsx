import { Text } from '@/components/ui/text';
import { Pressable, View } from 'react-native';
import { useThemeColor } from '@/lib/hooks/use-theme-color';
import GoogleIcon from '@/assets/icons/google.svg';

interface ContinueWithGoogleProps {
  onPress?: () => void;
}

export function ContinueWithGoogle({ onPress }: ContinueWithGoogleProps) {
  const colors = useThemeColor();

  const handleGoogleSignIn = () => {
    console.log('Sign in with Google');
    // TODO: Implement Google sign-in logic
    onPress?.();
  };

  return (
    <Pressable
      className="flex-row items-center justify-center gap-1 rounded-lg border border-border bg-card px-4 py-3 active:opacity-80"
      onPress={handleGoogleSignIn}
    >
      <View className="h-5 w-5 items-center justify-center">
        <GoogleIcon width={16} height={16} color={colors.foreground} />
      </View>
      <Text className="text-base font-semibold">Continue with Google</Text>
    </Pressable>
  );
}
