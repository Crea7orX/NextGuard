import { Text } from '@/components/ui/text';
import { View } from 'react-native';

export function BrandSection() {
  return (
    <View className="mb-8 items-center">
        <Text className="text-3xl font-bold">NextGuard</Text>
        <Text className="text-muted-foreground mt-2">Secure your devices</Text>
    </View>
  );
}
