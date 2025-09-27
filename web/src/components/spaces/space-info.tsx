import { AvatarWithFallback } from "~/components/common/avatar-with-fallback";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

interface Props extends React.ComponentProps<"div"> {
  image?: string | null;
  name: string;
  role?: string;
}

export function SpaceInfo({ className, image, name, role, ...props }: Props) {
  return (
    <div
      className={cn("flex items-center gap-2 overflow-hidden", className)}
      {...props}
    >
      <AvatarWithFallback className="rounded-sm" image={image} name={name} />
      <div className="overflow-hidden text-left text-sm">
        <p className="truncate">{name}</p>
        {role && (
          <p className="text-muted-foreground truncate text-xs">{role}</p>
        )}
      </div>
    </div>
  );
}

interface SkeletonProps extends React.ComponentProps<"div"> {
  hasRole?: boolean;
}

export function SpaceInfoSkeleton({
  className,
  hasRole = false,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn("flex items-center gap-2 overflow-hidden", className)}
      {...props}
    >
      <Skeleton className="size-6 rounded-sm" />
      <div className="grid gap-1 overflow-hidden text-left text-sm">
        <Skeleton className="h-4 w-40" />
        {hasRole && <Skeleton className="h-4 w-20" />}
      </div>
    </div>
  );
}
