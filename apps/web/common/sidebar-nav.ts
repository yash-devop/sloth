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

export type SidebarNavGroup = {
  label: string;
  items: SidebarNavItem[];
};

export const sidebarNavGroups: SidebarNavGroup[] = [
  {
    label: "Workspace",
    items: [
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
    ],
  },
  {
    label: "Command center",
    items: [
      {
        title: "Agent Action Center",
        href: "/dashboard/agent-action-center",
        icon: IconCrosshair,
      },
    ],
  },
];
