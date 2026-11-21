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
      <main className="w-full">
        <div className="h-14 border-b w-full">
          <AppSidebarTrigger when="collapsed" />
        </div>

        {children}
      </main>
    </SidebarProvider>
  );
}
