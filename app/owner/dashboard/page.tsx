import { OwnerDashboard } from "@/components/owner/owner-dashboard";
import { OwnerShell } from "@/components/owner/owner-shell";

export default function OwnerDashboardPage() {
  return (
    <OwnerShell active="Overview">
      <OwnerDashboard />
    </OwnerShell>
  );
}
