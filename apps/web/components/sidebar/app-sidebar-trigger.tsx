"use client";
import { SidebarTrigger, useSidebar } from "@repo/ui";
import { SmoothSlideMotion } from "@repo/ui/motion";
type AppSidebarTriggerProps = {
  when?: "expanded" | "collapsed";
};

export const AppSidebarTrigger = ({
  when = "expanded",
}: AppSidebarTriggerProps) => {
  const { open, openMobile, isMobile } = useSidebar();

  if (when === "expanded") {
    return (
      <SmoothSlideMotion show={isMobile ? openMobile : open}>
        <SidebarTrigger />
      </SmoothSlideMotion>
    );
  }

  return (
    <SmoothSlideMotion show={isMobile ? !openMobile : !open}>
      <SidebarTrigger />
    </SmoothSlideMotion>
  );
};
