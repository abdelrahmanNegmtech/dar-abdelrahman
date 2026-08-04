import type { LucideIcon } from "lucide-react";

export type SidebarItem = {
  label: string;
  href: string;
  badge?: string | number;
  icon: LucideIcon;
};

export type SidebarSection = {
  title: string;
  items: SidebarItem[];
};
