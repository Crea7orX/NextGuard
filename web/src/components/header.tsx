import { SidebarTrigger } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

export function Header({
  className,
  ...props
}: React.ComponentProps<"header">) {
  return (
    <header
      className={cn(
        "flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) group-has-data-[state=expanded]/sidebar-wrapper:hidden",
        className,
      )}
      {...props}
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <div className="ml-auto flex items-center gap-2">Profile</div>
      </div>
    </header>
  );
}
