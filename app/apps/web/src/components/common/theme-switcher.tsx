"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import React from "react";
import { cn } from "~/lib/utils";

const themes = [
  {
    key: "system",
    icon: Monitor,
    label: "System",
  },
  {
    key: "light",
    icon: Sun,
    label: "Light",
  },
  {
    key: "dark",
    icon: Moon,
    label: "Dark",
  },
];

export const ThemeSwitcher = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const { setTheme, theme } = useTheme();

  const [mounted, setMounted] = React.useState(false);

  const changeTheme = React.useCallback(
    (theme: string) => {
      setTheme(theme);
    },
    [setTheme],
  );

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "bg-background ring-border relative isolate flex h-8 rounded-full p-1 ring-1",
        className,
      )}
      {...props}
    >
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key;

        return (
          <button
            aria-label={label}
            className="relative size-6 rounded-full"
            key={key}
            onClick={() => changeTheme(key)}
            type="button"
          >
            {isActive && (
              <motion.div
                className="bg-secondary absolute inset-0 rounded-full"
                layoutId="activeTheme"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <Icon
              className={cn(
                "relative z-10 m-auto size-4",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
