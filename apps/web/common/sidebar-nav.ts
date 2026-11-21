import {
  IconBadges,
  IconBrandAsana,
  IconCrosshair,
  IconMail,
  IconNoiseReduction,
  type Icon,
} from "@tabler/icons-react";

export type SidebarNavItem = {
  title: string;
  href: string;
  icon: Icon;
};

export const workspaceNavItems: SidebarNavItem[] = [
  { title: "Inbox", href: "/dashboard", icon: IconMail },
  { title: "Priority", href: "/dashboard/priority", icon: IconBadges },
  {
    title: "Inbox zero",
    href: "/dashboard/inbox-zero",
    icon: IconNoiseReduction,
  },
  {
    title: "Tasks & Follow up",
    href: "/dashboard/tasks",
    icon: IconBrandAsana,
  },
];

export const commandCenterNavItems: SidebarNavItem[] = [
  {
    title: "Agent Action Center",
    href: "/dashboard/agent-action-center",
    icon: IconCrosshair,
  },
];
