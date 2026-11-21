import { AppSidebar, AppSidebarTrigger } from "@/components/sidebar";
import { SidebarProvider } from "@repo/ui/sidebar";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full">
        <div className="h-12 border-b w-full flex items-center px-4">
          <AppSidebarTrigger when="collapsed" />
        </div>
        <main className="p-4">{children}</main>
      </div>
    </SidebarProvider>
  );
}
