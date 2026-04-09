export type ShellNavItem = {
  label: string;
  to: string;
  end?: boolean;
};

export const SHELL_NAV_ITEMS: ShellNavItem[] = [
  { label: "Home", to: "/app", end: true },
  { label: "Journal", to: "/app/journal" },
  { label: "Todo", to: "/app/todo" },
  { label: "Public Hub", to: "/" },
];
