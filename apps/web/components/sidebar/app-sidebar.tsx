import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
} from "@repo/ui/sidebar";
import { AppSidebarHeader } from "./app-sidebar-header";

export const AppSidebar = () => {
  return (
    <Sidebar variant="sidebar">
      <AppSidebarHeader />
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
};
