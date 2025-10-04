import * as React from "react";
import { DashboardSidebar } from "~/components/dashboard/dashboard-sidebar";
import { Header } from "~/components/dashboard/header";
import { SelectSpacePrompt } from "~/components/dashboard/select-space-prompt";
import {
  NoSpaceSelected,
  SpaceSelected,
} from "~/components/spaces/no-space-selected";
import { TypeToConfirmAlertDialog } from "~/components/type-to-confirm-alert-dialog";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <DashboardSidebar variant="inset" />
        <SidebarInset>
          <Header />
          <NoSpaceSelected>
            <SelectSpacePrompt className="flex flex-1 items-center justify-center" />
          </NoSpaceSelected>
          <SpaceSelected>{children}</SpaceSelected>
        </SidebarInset>
      </SidebarProvider>
      <TypeToConfirmAlertDialog />
    </>
  );
}
