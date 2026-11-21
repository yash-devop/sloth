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
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { sidebarNavGroups } from "@/common/sidebar-nav";
import { AppSidebarHeader } from "./app-sidebar-header";

const isActivePath = (pathname: string, href: string) =>
  href === "/dashboard" ? pathname === href : pathname.startsWith(href);

export const AppSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar variant="sidebar">
      <AppSidebarHeader />
      <SidebarContent className="mt-1.5 px-0 mx-0">
        {sidebarNavGroups.map((group, index) => (
          <Fragment key={group.label}>
            {index > 0 && <SidebarSeparator className="mx-0 w-full" />}
            <SidebarGroup className="gap-1">
              <SidebarGroupLabel className="text-neutral-500 font-light text-[11px]">
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
                            "text-[13px]",
                            isActive ? "text-neutral-900" : "text-neutral-600",
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
      <SidebarFooter />
    </Sidebar>
  );
};
