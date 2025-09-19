import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

export function LastLoginBadge({
  className,
  ...props
}: React.ComponentProps<typeof Badge>) {
  return (
    <Badge className={cn("absolute -top-3 -right-2", className)} {...props}>
      Last used
    </Badge>
  );
}
