"use client";

import {
  AnimatePresence,
  motion,
  useAnimationControls,
  type HTMLMotionProps,
} from "motion/react";
import * as React from "react";
import { cn } from "~/lib/utils";

const DURATION = 0.2;
const EASE = "easeOut";

export function AnimatedMessage({
  className,
  children,
  uniqueKey = "default",
  ...props
}: HTMLMotionProps<"p"> & { children?: React.ReactNode; uniqueKey?: string }) {
  const nextBody = React.useMemo(() => {
    return children;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueKey]);

  // What is currently rendered
  const [displayBody, setDisplayBody] = React.useState<React.ReactNode>();
  const [displayKey, setDisplayKey] = React.useState<string>();

  // Container controls
  const wrapControls = useAnimationControls();
  const wrapRef = React.useRef<HTMLDivElement>(null);

  // Hidden measurer to get target height
  const measureWrapRef = React.useRef<HTMLDivElement>(null);
  const measureChildrenRef = React.useRef<React.ReactNode>(undefined);

  // Keep width context identical to real message
  const measureHeight = React.useCallback((children: React.ReactNode) => {
    measureChildrenRef.current = children;
    if (!measureWrapRef.current || !children) return 0;
    return measureWrapRef.current.offsetHeight;
  }, []);

  // Initialize container
  React.useEffect(() => {
    wrapControls.set({ height: 0, opacity: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Orchestration flags
  const [pendingBody, setPendingBody] = React.useState<React.ReactNode>();
  const [isShrinking, setIsShrinking] = React.useState(false);

  // React to external message changes
  React.useEffect(() => {
    if (nextBody === displayBody) {
      // Same text: just sync height (responsive reflow)
      const target = measureHeight(nextBody);
      void wrapControls.start({
        height: target,
        opacity: nextBody ? 1 : 0,
        transition: { duration: DURATION, ease: EASE },
      });
      return;
    }

    // First show
    if (!displayBody && nextBody) {
      const target = measureHeight(nextBody);
      void (async () => {
        await wrapControls.start({
          height: target,
          opacity: 1,
          transition: { duration: DURATION, ease: EASE },
        });
        setDisplayBody(nextBody); // mount then the text will animate in
        setDisplayKey(uniqueKey);
      })();
      return;
    }

    // Clear all
    if (displayBody && !nextBody) {
      // We’ll let the text exit first (handled in onExitComplete), then shrink to 0
      setPendingBody(undefined);
      setIsShrinking(true);
      setDisplayBody(undefined); // triggers exit
      setDisplayKey(undefined);
      return;
    }

    // Swap text
    if (displayBody && nextBody) {
      const currentH = wrapRef.current?.offsetHeight ?? 0;
      const targetH = measureHeight(nextBody);

      if (targetH > currentH) {
        // Grow first, then enter
        void (async () => {
          await wrapControls.start({
            height: targetH,
            opacity: 1,
            transition: { duration: DURATION, ease: EASE },
          });
          setDisplayBody(nextBody);
          setDisplayKey(uniqueKey);
        })();
        setIsShrinking(false);
      } else {
        // Exit first, then shrink, then enter
        setPendingBody(nextBody);
        setIsShrinking(true);
        setDisplayBody(undefined); // triggers exit
        setDisplayKey(undefined);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextBody, displayBody, measureHeight, wrapControls]);

  // After exit finishes: perform shrink (if needed), then mount pending text
  const handleExitComplete = async () => {
    if (!isShrinking) return;

    const targetH = pendingBody ? measureHeight(pendingBody) : 0;
    await wrapControls.start({
      height: targetH,
      opacity: pendingBody ? 1 : 0,
      transition: { duration: DURATION, ease: EASE },
    });

    if (pendingBody) {
      setDisplayBody(pendingBody); // mount new text after container landed
      setDisplayKey(uniqueKey);
      setPendingBody(undefined);
    }
    setIsShrinking(false);
  };

  return (
    <div className="relative">
      {/* Hidden measurer mirrors real DOM for accurate multi-line height */}
      <div
        ref={measureWrapRef}
        className={cn("inline-flex w-full gap-1 text-sm", className)}
        style={{
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none",
          insetInlineStart: 0,
          insetBlockStart: 0,
          whiteSpace: "normal",
        }}
        aria-hidden
      >
        {measureChildrenRef.current}
      </div>

      {/* Animated container controls height */}
      <motion.div
        ref={wrapRef}
        animate={wrapControls}
        initial={false}
        style={{ overflow: "hidden" }}
        aria-live="polite"
      >
        <AnimatePresence
          mode="wait"
          onExitComplete={handleExitComplete}
          initial={false}
        >
          {displayBody && (
            <motion.div
              key={displayKey}
              data-slot="form-message"
              className={className}
              initial={{ opacity: 0, y: "-75%" }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: "-75%",
              }}
              transition={{ duration: DURATION, ease: EASE }}
              {...props}
            >
              {displayBody}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
