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
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [currentWidth, setCurrentWidth] = React.useState<number>();

  React.useEffect(() => {
    if (!buttonRef.current) return;
    setCurrentWidth(undefined);
    setTimeout(() => {
      setCurrentWidth(buttonRef.current?.offsetWidth);
    }, 0);
  }, [children]);

  function getKey(children: React.ReactNode) {
    if (React.isValidElement(children)) {
      return children.key ?? "content";
    }
    return "content";
  }

  return (
    <Button
      ref={buttonRef}
      className={className}
      style={{ width: currentWidth ?? "auto" }}
      {...props}
    >
      <AnimatePresence mode="wait" initial={false}>
        {!isLoading && (
          <motion.span
            key={getKey(children)}
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.05, ease: "easeOut" }}
          >
            {children}
          </motion.span>
        )}
        {isLoading && (
          <motion.span
            key={"loading"}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.05, ease: "easeOut" }}
          >
            <LoaderCircle className="size-6 animate-spin" />
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
