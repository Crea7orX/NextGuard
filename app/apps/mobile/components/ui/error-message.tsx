import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <View className="flex-row items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2">
      <Icon as={AlertCircle} className='size-4 text-destructive' />
      <Text className="text-sm text-destructive flex-1">{message}</Text>
    </View>
  );
}
