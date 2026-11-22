import { Avatar, AvatarFallback, AvatarImage, SidebarHeader } from "@repo/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { IconChevronDown } from "@tabler/icons-react";
export const AppSidebarAccount = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex min-w-0 items-center gap-2 rounded-md px-1.5 py-1 -mx-1.5 transition-colors outline-none hover:bg-accent hover:text-accent-foreground data-popup-open:bg-neutral-200/60 data-popup-open:text-accent-foreground">
        <Avatar className={"size-5 ring ring-neutral-400"}>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback className={"text-[10px]"}>CN</AvatarFallback>
        </Avatar>

        <div className="flex items-center gap-x-2 text-neutral-500">
          <span className="truncate text-xs">Account</span>
          <IconChevronDown size={16} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={"mt-2 -mx-px"}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuItem>Subscription</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
