import type { ShareChannel, SharePropertyData } from "../types";

const appId = "dar-marketplace";

export function getShareText(property: SharePropertyData) {
  return `${property.title} - ${property.location} on DAR`;
}

export function getShareUrl(channel: Exclude<ShareChannel, "instagram" | "more">, property: SharePropertyData) {
  const encodedUrl = encodeURIComponent(property.url);
  const encodedText = encodeURIComponent(getShareText(property));

  if (channel === "whatsapp") {
    return `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
  }

  if (channel === "facebook") {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  }

  return `https://www.messenger.com/t/?link=${encodedUrl}&app_id=${appId}`;
}
