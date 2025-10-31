import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { useThemeColor } from '@/lib/hooks/use-theme-color';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  const colors = useThemeColor();

  return (
    <View className="flex-row items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2">
      <AlertCircle size={16} color={colors.destructive} />
      <Text className="text-sm text-destructive flex-1">{message}</Text>
    </View>
  );
}
