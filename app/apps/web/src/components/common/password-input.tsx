import { Eye, EyeOff } from "lucide-react";
import React from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

interface Props extends React.ComponentProps<typeof Input> {
  invalid: boolean;
}

export function PasswordInput({ className, invalid, ...props }: Props) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="group relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("pr-12", className)}
        aria-invalid={invalid}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute top-1 right-1 h-7 hover:bg-transparent"
        onClick={() => setShowPassword(!showPassword)}
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="size-4" />
        ) : (
          <Eye className="size-4" />
        )}
      </Button>
    </div>
  );
}
