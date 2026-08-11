import { OwnerShell } from "@/components/owner/owner-shell";

export default function OwnerDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <OwnerShell>{children}</OwnerShell>;
}
