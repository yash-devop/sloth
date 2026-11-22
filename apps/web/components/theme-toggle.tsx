"use client";

import { Button } from "@repo/ui/button";
import { IconMoonFilled, IconSunFilled } from "@tabler/icons-react";
import { useTheme } from "next-themes";

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      aria-label="Toggle theme"
      className="rounded-sm h-7 px-2 pl-1.5 w-fit text-secondary-foreground cursor-pointer has-[svg]:gap-1 text-[13px]"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <IconSunFilled className="mt-px dark:hidden" />
      <IconMoonFilled className="mt-px hidden dark:block" />
      <span className="dark:hidden">Light</span>
      <span className="hidden dark:block">Dark</span>
    </Button>
  );
};
