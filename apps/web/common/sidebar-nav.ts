import {
  IconBadges,
  IconBrandAsana,
  IconCrosshair,
  IconInbox,
  IconNoiseReduction,
  IconToggleLeft,
  type Icon,
} from "@tabler/icons-react";

export type SidebarNavItem = {
  title: string;
  href: string;
  icon: Icon;
};

export type SidebarNavGroup = {
  label: string;
  items: SidebarNavItem[];
};

export const sidebarNavGroups: SidebarNavGroup[] = [
  {
    label: "Workspace",
    items: [
       { title: "Inbox", href: "/inbox", icon: IconInbox },
      { title: "Priority", href: "/inbox/priority", icon: IconBadges },
      {
        title: "Inbox zero",
        href: "/inbox/inbox-zero",
        icon: IconNoiseReduction,
      },
      {
        title: "Tasks",
        href: "/inbox/tasks",
        icon: IconBrandAsana,
      },
    ],
  },
  {
    label: "Command center",
    items: [
      {
        title: "Agent Action Center",
        href: "/inbox/agent-action-center",
        icon: IconCrosshair,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Settings",
        href: "/inbox/settings",
        icon: IconToggleLeft,
      },
    ],
  },
];
