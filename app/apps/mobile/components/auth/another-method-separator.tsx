import { Text } from '@/components/ui/text';
import { View } from 'react-native';

interface AnotherMethodSeparatorProps {
  text?: string;
}

export function AnotherMethodSeparator({ text = 'Or continue with' }: AnotherMethodSeparatorProps) {
  return (
    <View className="flex-row items-center gap-4">
      <View className="h-px flex-1 bg-border" />
      <Text className="text-sm text-muted-foreground">{text}</Text>
      <View className="h-px flex-1 bg-border" />
    </View>
  );
}
