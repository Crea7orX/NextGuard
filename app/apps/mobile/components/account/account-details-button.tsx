import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { UserCircle } from 'lucide-react-native';

interface AccountDetailsButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  showIcon?: boolean;
  text?: string;
  onPress?: () => void;
}

export function AccountDetailsButton({
  variant = 'default',
  size = 'default',
  className,
  showIcon = true,
  text = 'Account Details',
  onPress,
}: AccountDetailsButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onPress={onPress}
      className={className}
    >
      {showIcon &&
        <Icon as={UserCircle} className={`${variant === 'default' ? 'text-primary-foreground ' : ''} size-4`}
      />}
      <Text>{text}</Text>
    </Button>
  );
}
