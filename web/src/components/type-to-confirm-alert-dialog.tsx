"use client";

import { TriangleAlert } from "lucide-react";
import React from "react";
import { AnimatedContainer } from "~/components/common/animated-container";
import { LoadingButton } from "~/components/common/loading-button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { FormResponseMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { typeToConfirm, useAlertStore } from "~/lib/type-to-confirm-store";

const isDev = process.env.NODE_ENV === "development";

export function TypeToConfirmAlertDialog() {
  const state = useAlertStore((s) => s.state);
  const close = useAlertStore((s) => s.close);
  const confirm = useAlertStore((s) => s._confirm);
  const cancel = useAlertStore((s) => s._cancel);

  const [showIsWrong, setShowIsWrong] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isLoading = state.isLoading ?? false;
  const confirmText = state.confirmText ?? "Confirm";
  const warning =
    state.warning !== undefined
      ? state.warning
      : "This action is permanent and irreversible.";

  React.useEffect(() => {
    if (state.open) return;
    clear();
  }, [state.open]);

  function setOpen(open: boolean) {
    if (open) return;
    close();
  }

  async function handleConfirm() {
    typeToConfirm.setMessage();

    const normalizedInput = state.caseInensitive
      ? inputValue.toLowerCase()
      : inputValue;
    const normalizedConfirmText = state.caseInensitive
      ? confirmText.toLowerCase()
      : confirmText;
    if (!isDev && normalizedInput !== normalizedConfirmText) {
      inputRef.current?.focus();
      setShowIsWrong(true);
      return;
    }

    void confirm?.();
  }

  function handleCancel() {
    void cancel?.();
  }

  function clear() {
    setInputValue("");
    setShowIsWrong(false);
  }

  return (
    <AlertDialog open={state.open} onOpenChange={setOpen}>
      <AlertDialogContent className="bg-muted gap-0 p-0">
        <div className="bg-background grid gap-4 rounded-lg border-b py-4 drop-shadow-xl">
          <AlertDialogHeader className="px-6">
            <AlertDialogTitle>{state.title}</AlertDialogTitle>
            {state.description && (
              <AlertDialogDescription>
                {state.description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <Separator />
          <div className="flex flex-col gap-4 px-6">
            <div className="-my-2">
              <FormResponseMessage
                variant={state.message?.variant}
                message={state.message?.message}
                icon={state.message?.icon}
                className="my-2"
              />
            </div>
            <Label htmlFor="confirm">
              Type &quot;{confirmText}&quot; to confirm
            </Label>
            <div className="grid gap-1">
              <Input
                id="confirm"
                placeholder={confirmText}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setShowIsWrong(false);
                }}
                disabled={isLoading}
                ref={inputRef}
              />
              <AnimatedContainer
                uniqueKey={showIsWrong ? "display" : "hidden"}
                variant="up"
                heightDuration={0.1}
              >
                {showIsWrong && (
                  <p className="text-destructive inline-flex w-full gap-1 text-sm">
                    <TriangleAlert className="size-3.5 shrink-0 translate-y-[0.1875rem]" />
                    <span>
                      Please type &quot;{confirmText}&quot; to confirm
                    </span>
                  </p>
                )}
              </AnimatedContainer>
            </div>
          </div>
          {warning && (
            <>
              <Separator />
              <p className="text-destructive inline-flex w-full gap-1 px-6 text-sm">
                <TriangleAlert className="size-3.5 shrink-0 translate-y-[0.1875rem]" />
                <span>{warning}</span>
              </p>
            </>
          )}
        </div>
        <AlertDialogFooter className="bg-muted rounded-b-lg px-6 py-4">
          <Button
            className="flex-1"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {state.cancelButtonText ?? "Cancel"}
          </Button>
          <LoadingButton
            className="flex-1"
            variant={state.confirmButtonVariant ?? "destructive"}
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {state.confirmButtonText ?? "Confirm"}
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
