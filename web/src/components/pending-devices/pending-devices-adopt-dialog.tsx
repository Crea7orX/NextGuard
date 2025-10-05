"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import React from "react";
import { useForm } from "react-hook-form";
import { AnimatedContainer } from "~/components/common/animated-container";
import { LoadingButton } from "~/components/common/loading-button";
import { PendingDevicesDelete } from "~/components/pending-devices/pending-devices-delete";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "~/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
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
import { Spinner } from "~/components/ui/spinner";
import { useConfirmPendingDeviceMutation } from "~/hooks/api/pending-devices/use-confirm-pending-device-mutation";
import { useGetPendingDeviceByIdQuery } from "~/hooks/api/pending-devices/use-get-pending-device-by-id-query";
import type { ErrorResponse } from "~/lib/responses";
import {
  pendingDeviceConfirmSchema,
  type PendingDeviceConfirm,
  type PendingDeviceResponse,
} from "~/lib/validation/pending-device";

interface Props extends React.ComponentProps<typeof Dialog> {
  pendingDevice?: PendingDeviceResponse;
}

export function PendingDevicesAdoptDialog({ pendingDevice, ...props }: Props) {
  const { data } = useGetPendingDeviceByIdQuery({
    id: pendingDevice?.id ?? "",
    refetchInterval: 1000,
    enabled: !!pendingDevice,
  });
  const { mutateAsync: confirm } = useConfirmPendingDeviceMutation({
    id: pendingDevice?.id ?? "",
  });

  const waitingForUserConfirmation =
    data?.state === "waiting_user_confirmation";

  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState<FormResponseMessageProps>();

  React.useEffect(() => {
    if (!props.open) return;
    setIsLoading(false);
    setMessage(undefined);
    form.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open]);

  const form = useForm<PendingDeviceConfirm>({
    resolver: zodResolver(pendingDeviceConfirmSchema),
    defaultValues: {
      name: "",
      description: "",
    },
    disabled: isLoading,
  });

  async function onSubmit(data: PendingDeviceConfirm) {
    setIsLoading(true);
    setMessage(undefined);

    await confirm(data)
      .then(() => {
        props.onOpenChange?.(false);
      })
      .catch((error: AxiosError<ErrorResponse<string>>) => {
        setMessage({ message: error.response?.data.error });
        return;
      });
    setIsLoading(false);
  }

  if (!pendingDevice) return null;
  return (
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    <Dialog {...props} open={props.open || isLoading}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adopting device</DialogTitle>
        </DialogHeader>
        <AnimatedContainer
          alwaysAvailable
          uniqueKey={waitingForUserConfirmation ? "form" : "waiting"}
        >
          {waitingForUserConfirmation ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormResponseMessage {...message} />
                <div className="grid gap-6 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter device name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter optional description"
                            {...field}
                          />
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
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="default">
                  <Spinner className="size-16" />
                </EmptyMedia>
                <EmptyTitle>Waiting for the device to respond</EmptyTitle>
                <EmptyDescription>
                  Make sure the device is powered on, it is connected to a
                  network or a hub and the mounting lid is removed.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <PendingDevicesDelete pendingDevice={pendingDevice}>
                  <Button size="sm" variant="destructive">
                    Remove device
                  </Button>
                </PendingDevicesDelete>
              </EmptyContent>
            </Empty>
          )}
        </AnimatedContainer>
      </DialogContent>
    </Dialog>
  );
}
