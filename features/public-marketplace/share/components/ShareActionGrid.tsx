"use client";

import {
  FacebookIcon,
  InstagramIcon,
  MessengerIcon,
  MoreHorizontalIcon,
  WhatsAppIcon,
} from "@/components/ui";
import { getShareUrl } from "../utils/shareUrls";
import { useNativeShare } from "../hooks/useNativeShare";
import type { ShareChannel, SharePropertyData } from "../types";
import { ShareActionButton } from "./ShareActionButton";

type ShareActionGridProps = {
  onCopyFallback: () => Promise<boolean>;
  onMessage: (message: { description: string; title: string; tone?: "success" | "error" | "info" }) => void;
  onSelect: (channel: ShareChannel) => void;
  property: SharePropertyData;
  selectedChannel: ShareChannel | null;
};

const actions = [
  { channel: "whatsapp" as const, color: "bg-[#EAFBF1] text-[#16A34A]", icon: WhatsAppIcon, label: "WhatsApp" },
  { channel: "facebook" as const, color: "bg-[#EEF4FF] text-[#2563EB]", icon: FacebookIcon, label: "Facebook" },
  { channel: "instagram" as const, color: "bg-[#FFF1F6] text-[#DB2777]", icon: InstagramIcon, label: "Instagram" },
  { channel: "messenger" as const, color: "bg-[#EEF4FF] text-[#3B82F6]", icon: MessengerIcon, label: "Messenger" },
  { channel: "more" as const, color: "bg-[#F4F1FF] text-[#5E2FE5]", icon: MoreHorizontalIcon, label: "More" },
];

export function ShareActionGrid({ onCopyFallback, onMessage, onSelect, property, selectedChannel }: ShareActionGridProps) {
  const nativeShare = useNativeShare();

  async function handleShare(channel: ShareChannel) {
    onSelect(channel);

    if (channel === "instagram") {
      onMessage({
        description: "Instagram does not support direct web sharing. Copy the link and paste it in Instagram.",
        title: "Instagram sharing is UI-only",
        tone: "info",
      });
      return;
    }

    if (channel === "more") {
      try {
        const shared = await nativeShare(property);
        if (!shared) {
          await onCopyFallback();
          onMessage({
            description: "Native share is unavailable here, so the link was copied instead.",
            title: "Native share unavailable",
            tone: "info",
          });
        }
      } catch {
        onMessage({
          description: "Native share was cancelled or unavailable.",
          title: "Share not completed",
          tone: "info",
        });
      }
      return;
    }

    window.open(getShareUrl(channel, property), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
      {actions.map((action) => (
        <ShareActionButton
          color={action.color}
          icon={action.icon}
          key={action.channel}
          label={action.label}
          onClick={() => handleShare(action.channel)}
          selected={selectedChannel === action.channel}
        />
      ))}
    </div>
  );
}
