import type { ReactNode } from "react";
import { TravelerLayout } from "@/features/traveler/components/TravelerLayout";
import { getTravelerShellData } from "@/features/traveler/data/queries";

export default async function Layout({ children }: { children: ReactNode }) {
  const shell = await getTravelerShellData();

  return (
    <TravelerLayout
      notificationsUnread={shell.notificationsUnread}
      profile={shell.profile}
      unreadMessages={shell.unreadMessages}
    >
      {children}
    </TravelerLayout>
  );
}
