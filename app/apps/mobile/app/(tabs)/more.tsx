import { Text } from '@/components/ui/text';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileCard } from '@/components/account/profile-card';

export default function MoreScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: insets.top }}
    >
      <ProfileCard
        name="Dimitar"
        username="mitko8009"
        email="dgd@pishkisoriz.com"
        initials="DM"
        onAccountDetailsPress={() => console.log('Account details pressed')}
      />

      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-2xl font-bold">More</Text>
        <Text className="mt-2 text-muted-foreground">
          Additional options and features
        </Text>
      </View>
    </ScrollView>
  );
}
