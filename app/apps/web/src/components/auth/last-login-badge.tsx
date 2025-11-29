import { motion } from "motion/react";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

export function LastLoginBadge({
  className,
  ...props
}: React.ComponentProps<typeof Badge>) {
  return (
    <Badge
      className={cn("absolute -top-3 -right-2", className)}
      asChild
      {...props}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        Last used
      </motion.div>
    </Badge>
  );
}
