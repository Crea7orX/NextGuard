import { DashboardSidebarNav } from "~/components/dashboard/dashboard-sidebar-nav";
import { SpaceSidebarSelector } from "~/components/dashboard/space-sidebar-selector";
import { UserSidebarMenu } from "~/components/dashboard/user-sidebar-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "~/components/ui/sidebar";

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SpaceSidebarSelector />
      </SidebarHeader>
      <SidebarContent>
        <DashboardSidebarNav />
      </SidebarContent>
      <SidebarFooter>
        <UserSidebarMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
