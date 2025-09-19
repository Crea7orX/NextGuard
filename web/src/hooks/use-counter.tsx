"use client";

import * as React from "react";

type UseCounterReturn = {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setCount: React.Dispatch<React.SetStateAction<number>>;
};

/**
 * Custom hook for counter state management with common operations
 * @param initialValue The initial count value (defaults to 0)
 * @returns An object containing count state and control functions
 */
export function useCounter(initialValue?: number): UseCounterReturn {
  const [count, setCount] = React.useState(initialValue ?? 0);

  const increment = React.useCallback(() => {
    setCount((x) => x + 1);
  }, []);

  const decrement = React.useCallback(() => {
    setCount((x) => x - 1);
  }, []);

  const reset = React.useCallback(() => {
    setCount(initialValue ?? 0);
  }, [initialValue]);

  return {
    count,
    increment,
    decrement,
    reset,
    setCount,
  };
}