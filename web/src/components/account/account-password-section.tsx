"use client";

import { AnimatePresence, motion } from "motion/react";
import React from "react";
import useMeasure from "react-use-measure";
import { AccountUpdatePasswordCard } from "~/components/account/account-update-password-card";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export function AccountPasswordSection({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [ref, { height }] = useMeasure({ offsetSize: true });

  const [isUpdating, setIsUpdating] = React.useState(false);

  return (
    <div
      className={cn("flex flex-col items-start gap-2 lg:flex-row", className)}
      {...props}
    >
      <div className="lg:w-52 lg:translate-y-1">
        <p>Password</p>
      </div>
      <motion.div
        className="w-full lg:flex-1"
        animate={{ height: height || "auto" }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            initial={{ opacity: [0, 1], scale: [0.95, 1] }}
            animate={{ opacity: [0, 1], scale: [0.95, 1] }}
            exit={{ opacity: [1, 0], scale: [1, 0.95] }}
            transition={{ duration: 0.4, ease: "easeOut", times: [0.5, 1] }}
            key={isUpdating ? "updating" : "default"}
            ref={ref}
          >
            {!isUpdating ? (
              <div className="flex flex-1 items-center gap-2 max-lg:pl-2 lg:gap-4">
                <p className="truncate text-lg font-bold">••••••••••</p>
                <Button
                  variant="outline"
                  className="ml-auto"
                  onClick={() => setIsUpdating(true)}
                >
                  Update password
                </Button>
              </div>
            ) : (
              <AccountUpdatePasswordCard
                className="w-full"
                onClose={() => setIsUpdating(false)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
