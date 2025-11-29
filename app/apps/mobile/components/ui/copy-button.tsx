import { Check, Copy } from "lucide-react-native";
import { useState, useCallback } from "react";
import { Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface CopyButtonProps extends Omit<ButtonProps, "onPress"> {
  value: string;
  successDuration?: number;
  onCopy?: (value: string) => void;
  showIcon?: boolean;
  showText?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export function CopyButton({
  value,
  successDuration = 2000,
  onCopy,
  showIcon = true,
  showText = false,
  successMessage = "Done",
  errorMessage = "Failed to copy",
  className,
  variant = "ghost",
  size = "sm",
  ...props
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback(async () => {
    if (!value) return;

    try {
      await Clipboard.setStringAsync(value);
      setIsCopied(true);
      onCopy?.(value);

      setTimeout(() => {
        setIsCopied(false);
      }, successDuration);
    } catch (error) {
      console.error("Failed to copy:", error);
      Alert.alert("Error", errorMessage);
    }
  }, [value, successDuration, onCopy, errorMessage]);

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "relative transition-colors",
        isCopied && "opacity-80",
        className
      )}
      onPress={copy}
      {...props}
    >
      {showIcon && (
        <Icon
          as={isCopied ? Check : Copy}
          className={cn(
            "size-4",
            isCopied ? "text-green-600 dark:text-green-400" : "text-foreground"
          )}
        />
      )}
      {showText && <Text>{isCopied ? successMessage : "Copy"}</Text>}
    </Button>
  );
}
