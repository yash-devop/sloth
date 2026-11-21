"use client";
import { SidebarTrigger, useSidebar } from "@repo/ui";

type AppSidebarTriggerProps = {
  when?: "expanded" | "collapsed";
};

export const AppSidebarTrigger = ({
  when = "expanded",
}: AppSidebarTriggerProps) => {
  const { open, isMobile } = useSidebar();

  if (when === "expanded") {
    return open && !isMobile ? <SidebarTrigger /> : null;
  }

  return !open || isMobile ? <SidebarTrigger /> : null;
};
