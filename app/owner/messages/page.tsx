import { MessageCircle } from "lucide-react";
import { OwnerShell } from "@/components/owner/owner-shell";

export default function OwnerMessagesPage() {
  return (
    <OwnerShell active="Messages">
      <div className="owner-dashboard-page">
        <h1 className="owner-page-title">Messages</h1>
        <p className="owner-page-description text-slate-500">Keep in touch with guests and the DAR support team.</p>
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <MessageCircle className="h-8 w-8 text-violet-600" />
          <h2 className="owner-card-title mt-4">No unread conversations</h2>
          <p className="owner-body mt-1 text-slate-500">New guest messages will appear here.</p>
        </div>
      </div>
    </OwnerShell>
  );
}
