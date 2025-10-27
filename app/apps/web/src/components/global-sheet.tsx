"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { useSheetStore } from "~/lib/sheet-store";

export function GlobalSheet() {
  const state = useSheetStore((s) => s.state);
  const close = useSheetStore((s) => s.close);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!state.isOpen) return;
        close();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close, state]);

  const renderCtx = React.useMemo(() => ({ close }), [close]);
  const body =
    typeof state.body === "function" ? state.body(renderCtx) : state.body;
  const footer =
    typeof state.footer === "function" ? state.footer(renderCtx) : state.footer;

  return (
    <Sheet open={state.isOpen} modal={false}>
      <SheetContent side={state.side} onCloseButtonClick={close}>
        {(state.title ?? state.description) && (
          <SheetHeader>
            {state.title && <SheetTitle>{state.title}</SheetTitle>}
            {state.description && (
              <SheetDescription>{state.description}</SheetDescription>
            )}
          </SheetHeader>
        )}

        <div className="flex-1 overflow-auto px-4">{body}</div>

        {footer && <SheetFooter>{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}
