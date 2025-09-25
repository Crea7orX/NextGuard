import { AvatarWithFallback } from "~/components/common/avatar-with-fallback";
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
