import {
  BarChart3,
  Building2,
  CalendarDays,
  CreditCard,
  Home,
  MessageSquareWarning,
  Settings,
  Shield,
  Star,
  UserRound,
  Users,
} from "lucide-react";

import type { SidebarGroup } from "./types";

export const adminSidebarGroups: SidebarGroup[] = [
  {
    title: "Management",
    items: [
      { label: "Overview", href: "/admin", icon: Home },
      { label: "Pending Approvals", href: "/admin#approvals", icon: Shield, badge: 23 },
      { label: "Properties", href: "/admin#properties", icon: Building2 },
      { label: "Users", href: "/admin#users", icon: Users },
      { label: "Owners", href: "/admin#owners", icon: UserRound },
      { label: "Bookings", href: "/admin#bookings", icon: CalendarDays },
      { label: "Payments", href: "/admin#payments", icon: CreditCard },
      { label: "Reports", href: "/admin#reports", icon: BarChart3 },
      { label: "Reviews", href: "/admin#reviews", icon: Star, badge: 12 },
      { label: "Disputes", href: "/admin#disputes", icon: MessageSquareWarning, badge: 3 },
      { label: "Settings", href: "/admin#settings", icon: Settings },
    ],
  },
];
