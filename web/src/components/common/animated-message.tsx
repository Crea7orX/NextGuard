"use client";

import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";
import * as React from "react";
import useMeasure from "react-use-measure";
import { cn } from "~/lib/utils";

export function AnimatedMessage({
  className,
  children,
  uniqueKey = "default",
  ...props
}: HTMLMotionProps<"div"> & {
  children?: React.ReactNode;
  uniqueKey?: string;
}) {
  const [ref, { height }] = useMeasure({ offsetSize: true });

  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      animate={{ height: height ?? "auto" }}
      transition={{ duration: 0.1, ease: "easeOut" }}
      {...props}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          initial={{ opacity: [0, 1], y: ["-75%", 0] }}
          animate={{ opacity: [0, 1], y: ["-75%", 0] }}
          exit={{ opacity: [1, 0], y: [1, "-75%"] }}
          transition={{ duration: 0.2, ease: "easeOut", times: [0.5, 1] }}
          key={uniqueKey}
          ref={ref}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
