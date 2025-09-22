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
  const initialLoading = React.useRef(true); // Use a ref to disable animation on initial render
  React.useEffect(() => {
    if (initialLoading.current) {
      initialLoading.current = false;
    }
  }, []);

  function getKey(children: React.ReactNode) {
    if (React.isValidElement(children)) {
      return children.key ?? "content";
    }
    return "content";
  }

  return (
    <Button className={className} {...props}>
      <AnimatePresence mode="wait">
        <motion.span
          key={isLoading ? "loading" : getKey(children)}
          initial={{ scale: initialLoading.current ? 1 : 0 }}
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
