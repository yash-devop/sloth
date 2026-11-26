# Theming in React & Next.js

A progression of dark/light theming approaches, from CSS-only to `next-themes`,
including the trade-offs that motivate each step.

## 1. Pure CSS: `prefers-color-scheme` (zero JS)

```css
:root {
  --bg: white;
  --text: black;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #111;
    --text: #eee;
  }
}
```

**Pros:** zero JS, no hydration issues, instant.

**Cons:** follows the OS only — the user cannot override it.

Modern CSS expresses the same idea with the `light-dark()` function:

```css
:root {
  color-scheme: light dark;
  --bg: light-dark(white, #111);
  --text: light-dark(black, #eee);
}
```

Still OS-only. A good default, but not a product-level toggle.

## 2. Toggle a class or attribute manually

```jsx
<button onClick={() => document.documentElement.classList.toggle("dark")}>
```

```css
.dark {
  --bg: #111;
  --text: #eee;
}
```

**Pros:** user control, and works with Tailwind's `dark:` variant.

**Cons:** forgotten on reload — there is no persistence.

## 3. Persist in `localStorage` + `useEffect`

```jsx
useEffect(() => {
  document.documentElement.classList.toggle(
    "dark",
    localStorage.theme === "dark",
  );
}, []);
```

**Pros:** the choice survives reloads.

**Cons:** flash of the wrong theme (FOUC). The HTML paints light first, then the
effect runs and flips it dark.

## 4. Blocking inline script (the real trick)

Run a tiny script before paint, inside `<head>`:

```html
<script>
  try {
    var theme = localStorage.theme;
    if (
      theme === "dark" ||
      (!theme && matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    }
  } catch {}
</script>
```

**Pros:** applies the theme before the first paint, so there is no flash.

**Cons:** hand-written, security-sensitive inline JS that runs outside React's
model and must be kept in sync with the app.

Also add `suppressHydrationWarning` to `<html>`, because the class differs from
the server output.

This script is the most important piece — it is most of what `next-themes`
exists to get right.

## 5. React Context + provider

```jsx
const ThemeContext = createContext();

// The provider holds theme and setTheme, writes the class and localStorage.
// Hook: const { theme, setTheme } = useContext(ThemeContext);
```

**Pros:** a clean component API and one source of truth.

**Cons:** on its own it still suffers from FOUC unless paired with step 4, and
the initial render cannot know the stored value.

## 6. SSR-aware: cookie + server-rendered class

```tsx
// app/layout.tsx (server component)
import { cookies } from "next/headers";

const theme = (await cookies()).get("theme")?.value ?? "light";

<html className={theme}>
```

The toggle writes the cookie and updates the DOM.

**Pros:** the server sends the correct class in the HTML, so there is no flash
and no inline script.

**Cons:** a cookie is unavailable on the very first request until the user
chooses; the "system" preference cannot be read server-side; toggling requires a
network round-trip or a client-side class patch.

## 7. Hydration-safe client reads

Any client-only value (`window`, `localStorage`, `matchMedia`) must not affect the
first render. Options:

- **`useSyncExternalStore(subscribe, getClient, getServer)`** — clean and
  lint-friendly.
- **`useEffect` + `mounted` flag** — the classic approach, but it triggers
  `set-state-in-effect` warnings.
- **Render both states and let CSS choose** (`dark:hidden` /
  `hidden dark:block`) — no state, no mismatch.

## 8. Tri-state: system / light / dark

Real products need three choices:

- `system` → resolve via `matchMedia("(prefers-color-scheme: dark)")`.
- `light` / `dark` → explicit override.
- Subscribe to OS changes while the mode is `system`.

At this point the implementation needs storage, a blocking script, a context,
hydration guards, a media-query listener, and a distinction between the selected
theme and the resolved theme. Hand-rolling it becomes painful.

## 9. The final boss: `next-themes`

`next-themes` packages steps 2–8 into one provider.

| Problem                   | `next-themes` solution                       |
| ------------------------- | -------------------------------------------- |
| Flash before paint        | injects the blocking script automatically    |
| Persistence               | `localStorage` (configurable)                |
| System preference         | `enableSystem` + live `matchMedia` listener  |
| API                       | `useTheme()` → `theme`, `resolvedTheme`, ... |
| SSR / hydration           | `suppressHydrationWarning`, safe defaults    |
| Class or attribute        | `attribute="class"` or `"data-theme"`        |
| `color-scheme`            | `enableColorScheme`                          |
| Transition flash          | `disableTransitionOnChange`                  |
| Multi-tab synchronization | storage event handling                       |

Every prior step is a bug that would otherwise be rediscovered one by one.

## Decision guide

| Need                                    | Use                                         |
| --------------------------------------- | ------------------------------------------- |
| Follow the OS only                      | CSS `prefers-color-scheme` / `light-dark()` |
| User toggle with persistence            | Step 4 blocking script + step 5 context     |
| Strict CSP, no inline scripts, no flash | Step 6 cookie + server-rendered class       |
| Multiple themes (not just dark)         | `next-themes` with `attribute="data-theme"` |

## Hydration, end to end

**1. The browser requests a page.**
The Next.js server runs the React components and produces plain HTML.

**2. The server sends HTML with no interactivity.**
The browser parses and paints it instantly. Nothing is clickable yet: no
`onClick`, no state, no `useTheme`.

**3. The browser fetches the JS bundle.**
React and the component code download after (or in parallel with) the HTML.

**4. React hydrates.**
React runs the components again in the browser. Instead of wiping the server
HTML, it walks the existing DOM and attaches event listeners, state, effects,
and context. When this finishes, the page is a live React app.

> Server render paints the skeleton. Hydration wires up the nerves.

**5. The matching rule.**
React expects the first client render to produce the same markup as the server
HTML. If it does not, you get a hydration mismatch: React warns, may discard and
re-render the tree, or the UI visibly flashes.

**6. Why a toggle can flicker.**
On the server there is no `localStorage` or `matchMedia`, so the markup assumes
the default theme. In the browser the saved preference is different. The server
and client disagree, so the toggle flashes before settling.

**7. The CSS-driven fix.**
Render both variants and let CSS decide:

```html
<span class="dark:hidden">Light</span>
<span class="hidden dark:block">Dark</span>
```

A blocking script puts `class="dark"` on `<html>` before the first paint, so CSS
shows the correct variant immediately. The server and client markup stay
identical, so there is no mismatch and no flicker.

**8. Mental model.**

| Phase     | Runs where | Output               | Interactive? |
| --------- | ---------- | -------------------- | ------------ |
| SSR       | server     | HTML                 | no           |
| Paint     | browser    | visible page         | no           |
| Hydration | browser    | same DOM + listeners | yes          |

Anything environment-dependent (`window`, `localStorage`, `Date.now()`,
`Math.random()`) must be deferred to an effect, read via
`useSyncExternalStore`, or rendered identically and resolved with CSS. Otherwise
the server and client disagree and hydration breaks.

**9. One-line summary.**
Hydration is React adopting server-rendered HTML and making it interactive; it
works smoothly only when the client's first render matches the server's HTML.
