import { Text } from '@/components/ui/text';
import { View, Pressable, Animated, Platform, UIManager, Easing, useColorScheme } from 'react-native';
import { UserCircle, ChevronDown } from 'lucide-react-native';
import { useState, useRef, useEffect } from 'react';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ProfileCardProps {
  name: string;
  username: string;
  email: string;
  initials: string;
  onAccountDetailsPress?: () => void;
}

export function ProfileCard({ name, username, email, initials, onAccountDetailsPress }: ProfileCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#ffffff' : '#000000';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: isExpanded ? 300 : 250,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(heightAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: isExpanded ? 450 : 350,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: false,
      }),
    ]).start();
  }, [isExpanded]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const maxHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  return (
    <View className="mx-4 mt-4 rounded-lg border border-border bg-card p-4 shadow-sm">
      <Pressable 
        className="flex-row items-center"
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View className="h-12 w-12 rounded-full bg-primary items-center justify-center">
          <Text className="text-xl font-bold text-primary-foreground">{initials}</Text>
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-xl font-bold">{name} "{username}"</Text>
          <Text className="text-sm text-muted-foreground">{email}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <ChevronDown size={24} color={iconColor} />
        </Animated.View>
      </Pressable>
      
      <Animated.View style={{ maxHeight, overflow: 'hidden' }}>
        <View className="my-4 h-px bg-border" />
        
        <Pressable 
          className="flex-row items-center justify-center gap-1 rounded-md bg-primary px-4 py-3 active:opacity-80"
          onPress={onAccountDetailsPress}
        >
          <UserCircle size={16} className='text-primary-foreground' />
          <Text className="text-sm font-semibold text-primary-foreground">
            Account Details
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
