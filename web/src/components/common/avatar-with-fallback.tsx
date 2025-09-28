import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";

interface Props extends React.ComponentProps<typeof Avatar> {
  image?: string | null;
  name: string;
  twoLetter?: boolean;
  largeSize?: boolean;
}

export function AvatarWithFallback({
  className,
  image,
  name,
  twoLetter = false,
  largeSize = false,
  ...props
}: Props) {
  const getInitials = () => {
    if (!twoLetter) {
      return name.charAt(0);
    }

    const nameParts = name.split(/\s+/);
    const firstInitial = nameParts[0]?.charAt(0) ?? "";
    const lastInitial = nameParts[nameParts.length - 1]?.charAt(0) ?? "";
    return `${firstInitial}${lastInitial}`;
  };

  return (
    <Avatar className={cn("size-6", className)} {...props}>
      <AvatarImage src={image ?? undefined} alt={name} />
      <AvatarFallback className={cn(!largeSize && "text-xs")}>
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
}
