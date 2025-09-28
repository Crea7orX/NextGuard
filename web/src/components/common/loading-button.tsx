import { LoaderCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import useMeasure from "react-use-measure";
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
  const [ref, { width }] = useMeasure({ offsetSize: true });
  const [currentWidth, setCurrentWidth] = React.useState<number | undefined>(
    width,
  );

  React.useEffect(() => {
    if (!isLoading) {
      setCurrentWidth(undefined);
      return;
    }
    setCurrentWidth(width);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  function getKey(children: React.ReactNode) {
    if (React.isValidElement(children)) {
      return children.key ?? "content";
    }
    return "content";
  }

  return (
    <Button
      ref={ref}
      className={className}
      style={{ minWidth: isLoading ? (currentWidth ?? "auto") : "auto" }}
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
