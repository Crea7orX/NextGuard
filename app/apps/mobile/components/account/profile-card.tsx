import { Text } from '@/components/ui/text';
import { View, Pressable, Animated, Platform, UIManager, Easing } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useState, useRef, useEffect } from 'react';
import { SignOutButton, AccountDetailsButton } from '@/components/account'
import { useAuth } from "@/hooks/useAuth";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ProfileCardProps {
  showSignOutButton?: boolean;
  showAccountDetailsButton?: boolean;
  onAccountDetailsPress?: () => void;
}

export function ProfileCard({
  showSignOutButton = true,
  showAccountDetailsButton = true,
  onAccountDetailsPress
}: ProfileCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;

  const name = user?.name || "Guest";
  const email = user?.email || "No email";
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || "G";

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
          <Text className="text-xl font-bold">{name}</Text>
          <Text className="text-sm text-muted-foreground">{email}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Icon as={ChevronDown} className='text-primary size-6' />
        </Animated.View>
      </Pressable>
      
      <Animated.View style={{ maxHeight, overflow: 'hidden' }} className="gap-3">
        <View className="mt-4 h-px bg-border" />
        
        {isAuthenticated && showAccountDetailsButton && (
          <AccountDetailsButton 
            className='w-full'
            onPress={() => onAccountDetailsPress?.()}
          />
        )}

        {isAuthenticated && showSignOutButton && (
          <SignOutButton
            className="w-full"
            variant='outline'
          />
        )}
      </Animated.View>
    </View>
  );
}
