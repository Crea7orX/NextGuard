import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { AvatarUpload } from "~/components/common/avatar-upload";
import { LoadingButton } from "~/components/common/loading-button";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
import { authClient } from "~/lib/auth-client";
import { convertFromBase64, convertToBase64 } from "~/lib/image";
import { updateUserSchema, type UpdateUser } from "~/lib/validation/auth/user";

interface Props extends React.ComponentProps<typeof Card> {
  onClose?: () => void;
  name?: string;
  image?: string | null;
}

export function AccountUpdateProfileCard({
  className,
  onClose,
  name = "",
  image,
  ...props
}: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState<FormResponseMessageProps>();

  const form = useForm<UpdateUser>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      firstName: name.split(/\s+/).slice(0, -1).join(" "),
      lastName: name.split(/\s+/).slice(-1)[0],
      image: image ? convertFromBase64(image) : undefined,
    },
    disabled: isLoading,
  });

  async function onSubmit(data: UpdateUser) {
    setIsLoading(true);
    setMessage(undefined);

    const { data: response, error } = await authClient.updateUser({
      name: `${data.firstName} ${data.lastName}`,
      image: data.image ? await convertToBase64(data.image) : null,
    });
    setIsLoading(false);

    if (error) {
      setMessage({ message: error.message });
      return;
    }
    if (!response) return;

    form.reset();
    onClose?.();
  }

  const onFileReject = React.useCallback(
    (_: File, message: string) => {
      form.setError("image", {
        type: "custom",
        message,
      });
    },
    [form],
  );

  const onFileClear = React.useCallback(() => {
    form.clearErrors("image");
  }, [form]);

  return (
    <Card className={className} {...props}>
      <CardHeader>
        <CardTitle>Update profile</CardTitle>
        <FormResponseMessage className="mt-4" {...message} />
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
          <CardContent className="grid gap-6">
            <FormField
              control={form.control}
              name="image"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Avatar</FormLabel>
                  <FormControl>
                    <AvatarUpload
                      invalid={fieldState.invalid}
                      onFileReject={onFileReject}
                      onFileClear={onFileClear}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid items-start gap-6 sm:grid-cols-2 sm:gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="First name"
                        autoComplete="given-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Last name"
                        autoComplete="family-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={form.formState.disabled}
            >
              Cancel
            </Button>
            <LoadingButton
              isLoading={isLoading}
              disabled={form.formState.disabled || !form.formState.isDirty}
            >
              Save
            </LoadingButton>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
