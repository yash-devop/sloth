"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@repo/ui/sidebar";
import { cn } from "@repo/ui/cn";
import { Button } from "@repo/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { IconChevronLeft } from "@tabler/icons-react";
import { sidebarNavGroups } from "@/common/sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppSidebarHeader } from "./app-sidebar-header";

const isActivePath = (pathname: string, href: string) =>
  href === "/inbox" ? pathname === href : pathname.startsWith(href);

export const AppSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar variant="sidebar" className="duration-[0.175s] ease-out">
      <AppSidebarHeader />
      <SidebarContent className="mt-1.5 px-0 mx-0 gap-1">
        {sidebarNavGroups.map((group, index) => (
          <Fragment key={group.label}>
            {index > 0 && <SidebarSeparator className="mx-0 w-full" />}
            <SidebarGroup className="gap-1">
              <SidebarGroupLabel className="text-muted-foreground font-light text-[11px]">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {group.items.map((item) => {
                    const isActive = isActivePath(pathname, item.href);

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={item.title}
                          render={<Link href={item.href} />}
                          className={cn(
                            "text-[13px] select-none",
                            isActive
                              ? "text-sidebar-accent-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </Fragment>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t flex flex-row items-center justify-between">
        <Button
          variant={"ghost"}
          className={
            "w-fit text-secondary-foreground cursor-pointer has-[svg]:gap-1 text-[13px] pl-1"
          }
        >
          <IconChevronLeft className="mt-px" />
          <span>Sign out</span>
        </Button>
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  );
};
