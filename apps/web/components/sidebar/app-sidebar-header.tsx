import { SidebarHeader } from "@repo/ui";
import { SlothIcon } from "../icons";
import { AppSidebarAccount } from "./app-sidebar-account";
import { AppSidebarTrigger } from "./app-sidebar-trigger";
import { SlothWorkmarkIcon } from "../icons/sloth-wordmark";
export const AppSidebarHeader = () => {
  return (
    <SidebarHeader className="border-b h-12 flex flex-row items-center gap-3.5 pl-4">
      <SlothWorkmarkIcon className="shrink-0" />
      {/* <SlothIcon className="shrink-0" /> */}
      <span className="text-sm text-muted-foreground">/</span>
      <div className="flex items-center justify-between w-full">
        <AppSidebarAccount />
        <AppSidebarTrigger />
      </div>
    </SidebarHeader>
  );
};
