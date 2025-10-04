"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import React from "react";
import { useForm } from "react-hook-form";
import { LoadingButton } from "~/components/common/loading-button";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormResponseMessage,
  type FormResponseMessageProps,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useCreatePendingDeviceMutation } from "~/hooks/api/pending-devices/use-create-pending-device-mutation";
import { getErrorMessage } from "~/lib/messages";
import {
  pendingDeviceCreateSchema,
  type PendingDeviceCreate,
} from "~/lib/validation/pending-device";

export function PendingDevicesCreateDialog({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog>) {
  const { mutateAsync: create } = useCreatePendingDeviceMutation();

  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState<FormResponseMessageProps>();

  const form = useForm<PendingDeviceCreate>({
    resolver: zodResolver(pendingDeviceCreateSchema),
    defaultValues: {
      serialId: "",
    },
    disabled: isLoading,
  });

  async function onSubmit(data: PendingDeviceCreate) {
    setIsLoading(true);
    setMessage(undefined);

    await create(data)
      .then(() => {
        form.reset();
        props.onOpenChange?.(false);
      })
      .catch((error) => {
        if (!(error instanceof AxiosError)) return;
        if (error.response?.status === 400) {
          form.setError("serialId", {
            type: "custom",
            message: "Invalid serial",
          });
          return;
        }
        if (error.response?.status === 409) {
          form.setError("serialId", {
            type: "custom",
            message: "Device with this serial already registered",
          });
          return;
        }

        setMessage({ message: getErrorMessage(error) });
      });
    setIsLoading(false);
  }

  return (
    <Dialog {...props}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add new device</DialogTitle>
              <FormResponseMessage {...message} />
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <FormField
                control={form.control}
                name="serialId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device serial #</FormLabel>
                    <FormControl>
                      <Input placeholder="Device serial number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={form.formState.disabled}
                >
                  Cancel
                </Button>
              </DialogClose>
              <LoadingButton
                isLoading={isLoading}
                disabled={form.formState.disabled}
              >
                Add device
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
