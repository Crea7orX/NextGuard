"use client";

import { DashboardSidebar } from "~/components/dashboard/dashboard-sidebar";
import { Header } from "~/components/header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";

export default function DashboardPage() {
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
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                DASHBOARD
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
