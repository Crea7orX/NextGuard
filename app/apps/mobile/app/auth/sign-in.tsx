import { AnotherMethodSeparator } from "@/components/auth/another-method-separator";
import { ContinueWithGoogleButton } from "@/components/auth/continue-with-google-button";
import { KeyboardAvoidingScrollView } from "@/components/ui/keyboard-avoiding-scroll-view";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { signInSchema } from "@repo/validations/auth/sign-in";
import { useForm } from "@tanstack/react-form";
import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

export default function SignInForm({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingProvider, setIsLoadingProvider] = React.useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      // TODO
      // rememberMe: true,
    },
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ value }) => {
      void authClient.signIn.email(value, {
        onRequest: () => {
          setIsLoading(true);
          console.log("Signing in with email...");
        },
        onError: (ctx) => {
          if (ctx.error.code === "EMAIL_NOT_VERIFIED") {
            // TODO: Navigate to verify email screen
            return;
          }

          setIsLoading(false);
        },
        onSuccess: () => {
          setIsLoading(false);
          console.log("Signed in successfully");
        },
      });
    },
  });

  const disabled = isLoading || isLoadingProvider;

  return (
    <KeyboardAvoidingScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ 
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 16,
        flexGrow: 1,
      }}
    >
      <View className={cn("grid gap-6", className)} {...props}>
        <ContinueWithGoogleButton
        // TODO
        // disabled={disabled}
        // setIsLoadingProvider={setIsLoadingProvider}
        />
        <AnotherMethodSeparator text="Or continue with" />
        <View className="grid gap-6">
          <form.Field
            name="email"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.nativeEvent.text)}
                    aria-invalid={isInvalid}
                    placeholder="Enter your email address"
                    autoComplete="email"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
          <form.Field
            name="password"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.nativeEvent.text)}
                    aria-invalid={isInvalid}
                    placeholder="Enter your password"
                    autoComplete="password"
                    secureTextEntry={true}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
          <Button
            className="w-full"
            onPress={() => form.handleSubmit()}
            disabled={disabled}
          >
            <Text className="text-primary-foreground">Sign In</Text>
          </Button>
        </View>
        <View>
        <Text className="text-center text-sm">
          Don&apos;t have an account? // TODO
          {/* <Link
            href={`/auth/sign-up`}
            className="underline underline-offset-4"
          >
            Sign up
          </Link> */}
        </Text>
        </View>
      </View>
      
    </KeyboardAvoidingScrollView>
  );
}
