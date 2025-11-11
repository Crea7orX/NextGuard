import { ContinueWithGoogleButton, AnotherMethodSeparator, BrandSection } from "@/components/auth";
import { KeyboardAvoidingScrollView } from "@/components/ui/keyboard-avoiding-scroll-view";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { signUpSchema } from "@repo/validations/auth/sign-up";
import { useForm } from "@tanstack/react-form";
import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { Link, useRouter } from "expo-router";
import BackButton from "@/components/ui/back-button";

export default function SignUpForm({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingProvider, setIsLoadingProvider] = React.useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
      firstName: "",
      lastName: "",
    },
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      void authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: `${value.firstName} ${value.lastName}`,
          // TODO: Add callbackURL when navigation is implemented
        },
        {
          onRequest: () => {
            setIsLoading(true);
            console.log("Signing up with email...");
          },
          onError: (ctx) => {
            setIsLoading(false);
            console.error("Sign up error:", ctx.error.message);
          },
          onSuccess: () => {
            setIsLoading(false);
            console.log("Signed up successfully");
            // Navigate to verify email screen with email parameter
            router.push(`/auth/verify-email?email=${encodeURIComponent(value.email)}`);
          },
        }
      );
    },
  });

  const disabled = isLoading || isLoadingProvider;

  return (
    <KeyboardAvoidingScrollView
      className="bg-background flex-1"
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 16,
        flexGrow: 1,
      }}
    >
      <View className="w-full max-w-md mx-auto">
        <BackButton className="absolute left-1 top-1" />
        <BrandSection />
        <View className={cn("grid gap-6", className)} {...props}>
          <ContinueWithGoogleButton
            // TODO
            disabled={disabled}
            setIsLoadingProvider={setIsLoadingProvider}
          />
          <AnotherMethodSeparator text="Or continue with" />
          <View className="grid gap-6">
            <View className="flex-row gap-4">
              <form.Field
                name="firstName"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid} className="flex-1">
                      <FieldLabel htmlFor={field.name}>First Name</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.nativeEvent.text)}
                        aria-invalid={isInvalid}
                        placeholder="Enter your first name"
                        autoComplete="given-name"
                        autoCapitalize="words"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />
              <form.Field
                name="lastName"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid} className="flex-1">
                      <FieldLabel htmlFor={field.name}>Last Name</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.nativeEvent.text)}
                        aria-invalid={isInvalid}
                        placeholder="Enter your last name"
                        autoComplete="family-name"
                        autoCapitalize="words"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />
            </View>
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
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
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
                      placeholder="Create a password"
                      autoComplete="password-new"
                      secureTextEntry={true}
                      autoCapitalize="none"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="passwordConfirmation"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.nativeEvent.text)}
                      aria-invalid={isInvalid}
                      placeholder="Confirm your password"
                      autoComplete="password-new"
                      secureTextEntry={true}
                      autoCapitalize="none"
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
              <Text className="text-primary-foreground">Sign Up</Text>
            </Button>
          </View>
          <View>
            <Text className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/sign-in">
                <Text className="text-sm font-semibold text-primary underline">Sign in</Text>
              </Link>
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingScrollView>
  );
}
