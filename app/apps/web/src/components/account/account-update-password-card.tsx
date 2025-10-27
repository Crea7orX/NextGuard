import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { LoadingButton } from "~/components/common/loading-button";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
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
import { authClient } from "~/lib/auth-client";
import {
  updatePasswordSchema,
  type UpdatePassword,
} from "~/lib/validation/auth/password";
import { PasswordInput } from "../common/password-input";

interface Props extends React.ComponentProps<typeof Card> {
  onClose?: () => void;
}

export function AccountUpdatePasswordCard({
  className,
  onClose,
  ...props
}: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState<FormResponseMessageProps>();

  const form = useForm<UpdatePassword>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      newPassword: "",
      newPasswordConfirmation: "",
      revokeOtherSessions: true,
    },
    disabled: isLoading,
  });

  async function onSubmit(data: UpdatePassword) {
    setIsLoading(true);
    setMessage(undefined);

    const { data: response, error } = await authClient.changePassword({
      currentPassword: data.password,
      newPassword: data.newPassword,
      revokeOtherSessions: data.revokeOtherSessions,
    });
    setIsLoading(false);

    if (error) {
      if (error.code === "INVALID_PASSWORD") {
        form.setError("password", {
          type: "custom",
          message: "Invalid password",
        });
        return;
      }

      setMessage({ message: error.message });
      return;
    }
    if (!response) return;

    form.reset();
    onClose?.();
  }

  return (
    <Card className={className} {...props}>
      <CardHeader>
        <CardTitle>Update password</CardTitle>
        <FormResponseMessage className="mt-4" {...message} />
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
          <CardContent className="grid gap-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Enter your current password"
                      autoComplete="current-password"
                      invalid={!!fieldState.invalid}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Enter your new password"
                      autoComplete="new-password"
                      invalid={!!fieldState.invalid}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPasswordConfirmation"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Confirm your new password"
                      autoComplete="new-password"
                      invalid={!!fieldState.invalid}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="revokeOtherSessions"
              render={({ field }) => (
                <FormItem className="flex gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="grid gap-1">
                    <FormLabel>Sign out of all other devices</FormLabel>
                    <FormLabel className="text-muted-foreground font-normal">
                      It is recommended to sign out of all other devices which
                      may have used your old password.
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
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
              disabled={form.formState.disabled}
            >
              Save
            </LoadingButton>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
