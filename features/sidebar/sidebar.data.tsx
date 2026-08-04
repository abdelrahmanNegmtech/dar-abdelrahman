import {
  BarChart3,
  Building2,
  CalendarDays,
  CreditCard,
  Home,
  LifeBuoy,
  MessageSquareWarning,
  Settings,
  Shield,
  Star,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";

import type { SidebarSection } from "./sidebar.types";

// ── Admin Sidebar ── //
export const adminSidebarSections: SidebarSection[] = [
  {
    title: "Management",
    items: [
      { label: "Overview", href: "/admin", icon: Home },
      { label: "Pending Approvals", href: "/admin/approvals", icon: Shield, badge: 23 },
      { label: "Properties", href: "/admin/properties", icon: Building2 },
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Owners", href: "/admin/owners", icon: UserRound },
      { label: "Bookings", href: "/admin/bookings", icon: CalendarDays },
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
      { label: "Reports", href: "/admin/reports", icon: BarChart3 },
      { label: "Reviews", href: "/admin/reviews", icon: Star, badge: 12 },
      { label: "Disputes", href: "/admin/disputes", icon: MessageSquareWarning, badge: 3 },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

// ── Owner Sidebar ── //
export const ownerSidebarSections: SidebarSection[] = [
  {
    title: "Portal",
    items: [
      { label: "Properties", href: "/owner/properties", icon: Building2 },
      { label: "Bookings", href: "/owner/bookings", icon: CalendarDays },
      { label: "Payouts", href: "/owner/payouts", icon: Wallet },
      { label: "Verification", href: "/owner/verification", icon: Shield },
      { label: "Help Center", href: "/owner/help-center", icon: LifeBuoy },
    ],
  },
];
