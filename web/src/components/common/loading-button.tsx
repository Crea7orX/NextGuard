import { LoaderCircle } from "lucide-react";
import { Button } from "~/components/ui/button";

interface Props extends React.ComponentProps<typeof Button> {
  isLoading?: boolean;
  children: React.ReactNode;
}

export function LoadingButton({
  className,
  isLoading,
  children,
  ...props
}: Props) {
  return (
    <Button className={className} {...props}>
      {isLoading ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <span>{children}</span>
      )}
    </Button>
  );
}
