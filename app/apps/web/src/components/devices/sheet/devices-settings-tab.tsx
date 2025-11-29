import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import React from "react";
import { useForm } from "react-hook-form";
import { LoadingButton } from "~/components/common/loading-button";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
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
import { useUpdateDeviceByIdMutation } from "~/hooks/api/devices/use-update-device-by-id-mutation";
import type { ErrorResponse } from "~/lib/responses";
import { cn } from "~/lib/utils";
import {
  deviceUpdateSchema,
  type DeviceResponse,
  type DeviceUpdate,
} from "~/lib/validation/devices";

interface Props extends React.ComponentProps<"div"> {
  device: DeviceResponse;
}

export function DevicesSettingsTab({ className, device, ...props }: Props) {
  const { mutateAsync: update } = useUpdateDeviceByIdMutation({
    id: device.id,
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState<FormResponseMessageProps>();

  const form = useForm<DeviceUpdate>({
    resolver: zodResolver(deviceUpdateSchema),
    defaultValues: {
      name: device.name,
      description: device.description,
    },
    disabled: isLoading,
  });

  React.useEffect(() => {
    form.reset({
      name: device.name,
      description: device.description,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  async function onSubmit(data: DeviceUpdate) {
    setIsLoading(true);
    setMessage(undefined);

    const dirtyFields = form.formState.dirtyFields;
    const updatedData = Object.keys(dirtyFields).reduce((acc, key) => {
      if (dirtyFields[key as keyof DeviceUpdate]) {
        return { ...acc, [key]: data[key as keyof DeviceUpdate] };
      }
      return acc;
    }, {});

    await update(updatedData)
      .then(() => {
        form.reset(form.getValues());
      })
      .catch((error: AxiosError<ErrorResponse<string>>) => {
        setMessage({ message: error.response?.data.error });
        return;
      });
    setIsLoading(false);
  }

  return (
    <div
      className={cn(
        "relative flex flex-col gap-3",
        form.formState.isDirty && "pb-12",
        className,
      )}
      {...props}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormResponseMessage className="mb-2" {...message} />
          <Card className="!py-4">
            <CardContent className="grid gap-4 !px-4">
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
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          {form.formState.isDirty && (
            <div className="bg-background absolute bottom-0 flex w-full justify-end gap-2 p-4">
              <Button
                variant="outline"
                type="button"
                disabled={form.formState.disabled}
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
              <LoadingButton
                disabled={form.formState.disabled}
                isLoading={isLoading}
              >
                Apply changes
              </LoadingButton>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
