"use client";

import type * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import * as React from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { AnimatedContainer } from "~/components/common/animated-container";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={className}
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function FormMessage({
  className,
  children,
  ...props
}: React.ComponentProps<"p"> & { children?: React.ReactNode }) {
  const { error, formMessageId } = useFormField();
  const body = React.useMemo(() => {
    return error ? (
      <p
        className={cn(
          "text-destructive inline-flex w-full gap-1 text-sm",
          className,
        )}
        {...props}
      >
        <TriangleAlert className="size-3.5 shrink-0 translate-y-[0.1875rem]" />
        <span>{error.message ?? ""}</span>
      </p>
    ) : (
      children
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error?.message]);

  return (
    <AnimatedContainer
      data-slot="form-message"
      uniqueKey={error?.message}
      id={formMessageId}
      variant="up"
      heightDuration={0.125}
    >
      {body}
    </AnimatedContainer>
  );
}

const formResponseMessageVariants = cva(
  "inline-flex items-center w-full gap-3 rounded-md border p-4",
  {
    variants: {
      variant: {
        destructive: "bg-destructive/5 border-destructive text-destructive",
        success: "bg-primary/5 border-primary text-primary",
      },
    },
    defaultVariants: {
      variant: "destructive",
    },
  },
);

const formResponseMessageVariantIcons: Record<
  NonNullable<FormResponseMessageProps["variant"]>,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  destructive: TriangleAlert,
  success: CheckCircle2,
};

export interface FormResponseMessageProps
  extends VariantProps<typeof formResponseMessageVariants> {
  message?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

function FormResponseMessage({
  className,
  variant = "destructive",
  message,
  children,
  icon,
  ...props
}: React.ComponentProps<"p"> & FormResponseMessageProps) {
  const IconComponent = React.useMemo(() => {
    if (icon) return icon;
    if (variant && variant in formResponseMessageVariantIcons) {
      return formResponseMessageVariantIcons[variant];
    }
    return TriangleAlert;
  }, [icon, variant]);

  const body = React.useMemo(() => {
    return message ? (
      <p
        className={cn(formResponseMessageVariants({ variant, className }))}
        {...props}
      >
        <IconComponent className="size-6 shrink-0" />
        <span className="text-sm">{message}</span>
      </p>
    ) : (
      children
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, variant, IconComponent]);

  return <AnimatedContainer uniqueKey={message}>{body}</AnimatedContainer>;
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormResponseMessage,
  useFormField,
};
