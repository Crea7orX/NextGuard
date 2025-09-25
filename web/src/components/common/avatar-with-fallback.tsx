import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";

interface Props extends React.ComponentProps<typeof Avatar> {
  image?: string | null;
  name: string;
}

export function AvatarWithFallback({
  className,
  image,
  name,
  ...props
}: Props) {
  return (
    <Avatar className={cn("size-6", className)} {...props}>
      <AvatarImage src={image ?? undefined} alt={name} />
      <AvatarFallback>{name.charAt(0)}</AvatarFallback>
    </Avatar>
  );
}
