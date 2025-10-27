import { Home, Smartphone } from "lucide-react";

export const dashboardSidebarNav = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/dashboard",
    isActive: (href: string) => {
      return href === "/dashboard";
    },
  },
  {
    title: "Devices",
    icon: Smartphone,
    href: "/dashboard/devices",
    isActive: (href: string) => {
      return href.startsWith("/dashboard/devices");
    },
  },
];
