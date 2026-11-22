"use client";

import { Button } from "@repo/ui/button";
import { IconMoonFilled, IconSunFilled } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

const useMounted = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      className="rounded-sm h-7 px-2 pl-1.5 w-fit text-secondary-foreground cursor-pointer has-[svg]:gap-1 text-[13px]"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <IconMoonFilled className="mt-px" />
      ) : (
        <IconSunFilled className="mt-px" />
      )}
      <span>{isDark ? "Dark" : "Light"}</span>
    </Button>
  );
};
