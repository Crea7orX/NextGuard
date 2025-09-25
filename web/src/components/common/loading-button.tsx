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
    setTimeout(() => {setCurrentWidth(buttonRef.current?.offsetWidth);}, 0);
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
