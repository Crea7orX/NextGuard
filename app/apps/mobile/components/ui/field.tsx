import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { useMemo } from "react";
import { View, Text } from "react-native";

function FieldSet({ className, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn(
        "flex flex-col gap-6",
        className,
      )}
      {...props}
    />
  );
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<typeof Text> & { variant?: "legend" | "label" }) {
  return (
    <Text
      className={cn(
        "mb-3 font-medium",
        variant === "legend" ? "text-base" : "text-sm",
        className,
      )}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn(
        "flex w-full flex-col gap-7",
        className,
      )}
      {...props}
    />
  );
}

const fieldVariants = cva(
  "flex w-full gap-3",
  {
    variants: {
      orientation: {
        vertical: ["flex-col"],
        horizontal: [
          "flex-row items-center",
        ],
        responsive: [
          "flex-col",
        ],
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  },
);

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof View> & VariantProps<typeof fieldVariants>) {
  return (
    <View
      role="group"
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

function FieldContent({ className, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn(
        "flex flex-1 flex-col gap-1.5",
        className,
      )}
      {...props}
    />
  );
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      className={cn(
        "flex w-fit gap-2",
        className,
      )}
      {...props}
    />
  );
}

function FieldTitle({ className, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn(
        "flex w-fit items-center gap-1",
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn(
        "text-muted-foreground text-sm font-normal leading-normal",
        className,
      )}
      {...props}
    />
  );
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<typeof View> & {
  children?: React.ReactNode;
}) {
  return (
    <View
      className={cn(
        "relative -my-2 h-5 text-sm",
        className,
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <Text
          className="bg-background text-muted-foreground relative mx-auto w-fit px-2"
        >
          {children}
        </Text>
      )}
    </View>
  );
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<typeof View> & {
  errors?: Array<{ message?: string } | undefined>;
}) {
  const content = useMemo(() => {
    if (children) {
      return children;
    }

    if (!errors?.length) {
      return null;
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ];

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message;
    }

    return (
      <View className="ml-4 flex flex-col gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && (
              <Text key={index} className="text-destructive text-sm">
                • {error.message}
              </Text>
            )
        )}
      </View>
    );
  }, [children, errors]);

  if (!content) {
    return null;
  }

  return (
    <View
      role="alert"
      className={cn("text-destructive text-sm font-normal", className)}
      {...props}
    >
      {typeof content === 'string' ? <Text className="text-destructive text-sm">{content}</Text> : content}
    </View>
  );
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
};
