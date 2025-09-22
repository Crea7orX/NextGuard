import { LoaderCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { Button } from "~/components/ui/button";

interface Props extends React.ComponentProps<typeof Button> {
  isLoading?: boolean;
}

export function LoadingButton({
  className,
  isLoading,
  children,
  ...props
}: Props) {
  function getKey(children: React.ReactNode) {
    if (React.isValidElement(children)) {
      return children.key ?? "content";
    }
    return "content";
  }

  return (
    <Button className={className} {...props}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isLoading ? "loading" : getKey(children)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          {isLoading ? (
            <LoaderCircle className="size-6 animate-spin" />
          ) : (
            children
          )}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
