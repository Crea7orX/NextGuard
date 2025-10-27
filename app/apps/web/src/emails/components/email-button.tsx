import { Button } from "@react-email/components";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-block rounded-md text-center text-base font-medium whitespace-nowrap no-underline transition-all outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 ",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "px-6 py-3",
        sm: "px-4 py-2 text-sm",
        lg: "px-8 py-4 text-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export function EmailButton({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof Button> & VariantProps<typeof buttonVariants>) {
  return (
    <Button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
