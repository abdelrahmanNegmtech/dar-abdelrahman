import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { marketplaceImages } from "@/features/public-marketplace/assets";
import { getPropertyFallbackPreset } from "@/features/properties/data/public-property-fallbacks";
import type { TravelerConversation, TravelerMessage, TravelerProperty } from "@/features/traveler/types";
import { devConversations, devProfile, devProperties } from "@/features/traveler/data/devData";
import { isDevAuthBypassEnabled } from "@/lib/auth/devAuthBypass";
import type { Database } from "@/lib/supabase/database.types";
import { getCurrentProfile, requireAuthenticatedUser, requireOwner } from "@/lib/supabase/auth";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

type ConversationSummaryRow =
  Database["public"]["Functions"]["get_my_conversations"]["Returns"][number];
type ConversationMessageRow =
  Database["public"]["Functions"]["get_conversation_messages"]["Returns"][number];

type ViewerRole = "traveler" | "owner";

type MessagingData = {
  conversations: TravelerConversation[];
  selectedConversation: TravelerConversation | null;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string | undefined) {
  return Boolean(value && uuidPattern.test(value));
}

function normalizeImageUrl(value: string | null | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  if (value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return fallback;
}

function toMajorAmount(amountMinor: number | null | undefined) {
  return Math.round((amountMinor ?? 0) / 100);
}

function buildPropertyImage(slug: string | null | undefined) {
  if (!slug) {
    return {
      imagePosition: "object-center",
      imageUrl: marketplaceImages.modernApartment,
    };
  }

  const preset = getPropertyFallbackPreset(slug);

  return {
    imagePosition: preset.gallery[0]?.position ?? "object-center",
    imageUrl: preset.gallery[0]?.src ?? marketplaceImages.modernApartment,
  };
}

function mapProperty(summary: ConversationSummaryRow): TravelerProperty {
  const image = buildPropertyImage(summary.property_slug);

  return {
    address: "",
    amenities: [],
    area: summary.property_area ?? summary.property_city ?? "",
    areaSize: 1,
    bathrooms: 1,
    bedrooms: Math.max(1, summary.property_bedrooms_count ?? 1),
    city: summary.property_city ?? "",
    country: summary.property_country_name ?? "",
    currency: "EGP",
    description: summary.subject ?? summary.property_title ?? "Conversation property context.",
    id: summary.property_id,
    imagePosition: image.imagePosition,
    imageUrl: image.imageUrl,
    isFeatured: false,
    isSaved: false,
    maxGuests: Math.max(1, summary.property_max_guests ?? 1),
    ownerId: summary.participant_role === "owner" ? summary.participant_id : "",
    pricePerNight: toMajorAmount(summary.property_base_nightly_amount),
    ratingAverage: 4.9,
    reviewsCount: 0,
    status: "published",
    title: summary.property_title ?? "Property",
    type: summary.property_type === "villa"
      ? "villa"
      : summary.property_type === "studio"
        ? "studio"
        : summary.property_type === "duplex"
          ? "duplex"
          : summary.property_type === "hotel"
            ? "hotel"
            : "apartment",
  };
}

function buildAttachment(row: ConversationMessageRow): TravelerMessage["attachment"] | undefined {
  if (!row.attachment_file_name) {
    return undefined;
  }

  const normalizedName = row.attachment_file_name;
  const extension = normalizedName.split(".").pop()?.toLowerCase();
  const attachmentType =
    row.message_type === "image"
      ? "image"
      : extension === "pdf"
        ? "pdf"
        : "file";

  return {
    id: `${row.message_id}-attachment`,
    name: normalizedName,
    size: "Private attachment",
    sizeBytes: 0,
    type: attachmentType,
  };
}

function mapMessage(
  row: ConversationMessageRow,
  viewerId: string,
  viewerName: string,
  viewerAvatarUrl: string,
): TravelerMessage {
  return {
    attachment: buildAttachment(row),
    body: row.deleted_at
      ? "Message deleted"
      : row.body ?? row.attachment_file_name ?? "Shared attachment",
    createdAt: row.created_at,
    id: row.message_id,
    isDeleted: Boolean(row.deleted_at),
    isOwn: row.sender_id === viewerId,
    messageType: row.deleted_at ? "text" : row.message_type,
    readAt: undefined,
    replyTo: row.reply_to_message_id
      ? {
          body: row.reply_to_body ?? "Replied to a previous message",
          id: row.reply_to_message_id,
          senderName: row.reply_to_sender_name ?? "Conversation participant",
        }
      : null,
    senderAvatarUrl: normalizeImageUrl(
      row.sender_avatar_url,
      row.sender_id === viewerId ? viewerAvatarUrl : marketplaceImages.host,
    ),
    senderId: row.sender_id ?? "system",
    senderName: row.sender_id === viewerId ? viewerName : row.sender_name ?? "DAR system",
  };
}

function buildLastPreview(messages: TravelerMessage[], summary: ConversationSummaryRow) {
  const lastMessage = messages.at(-1);

  if (lastMessage) {
    return lastMessage;
  }

  if (!summary.last_message_id) {
    return null;
  }

  return {
    body: summary.last_message_deleted
      ? "Message deleted"
      : summary.last_message_body ?? summary.last_message_attachment_file_name ?? "",
    createdAt: summary.last_message_created_at ?? summary.conversation_updated_at,
    id: summary.last_message_id,
    isDeleted: summary.last_message_deleted,
    isOwn: false,
    messageType: summary.last_message_type ?? "text",
    senderAvatarUrl: marketplaceImages.host,
    senderId: summary.last_message_sender_id ?? "system",
    senderName: summary.last_message_sender_name ?? "Conversation participant",
  } satisfies TravelerMessage;
}

async function getSupabaseMessagingData(
  viewerRole: ViewerRole,
  selectedConversationId?: string,
  bookingId?: string,
): Promise<MessagingData> {
  noStore();
  const user = viewerRole === "owner"
    ? (await requireOwner()).user
    : await requireAuthenticatedUser();
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  let preferredConversationId = isUuid(selectedConversationId) ? selectedConversationId : undefined;

  if (!preferredConversationId && isUuid(bookingId)) {
    const { data, error } = await supabase.rpc("create_or_get_booking_conversation", {
      booking_uuid: bookingId!,
    });

    if (!error) {
      preferredConversationId = (data ?? [])[0]?.conversation_id;
    }
  }

  const { data: summaries, error: summariesError } = await supabase.rpc("get_my_conversations");

  if (summariesError) {
    throw new Error("Unable to load conversations.");
  }

  const summaryRows = (summaries ?? []) as ConversationSummaryRow[];

  if (!summaryRows.length) {
    return { conversations: [], selectedConversation: null };
  }

  const messageRowsByConversation = new Map<string, ConversationMessageRow[]>();

  for (const summary of summaryRows) {
    const { data: messages, error: messagesError } = await supabase.rpc("get_conversation_messages", {
      conversation_uuid: summary.conversation_id,
    });

    if (messagesError) {
      throw new Error("Unable to load conversation messages.");
    }

    messageRowsByConversation.set(
      summary.conversation_id,
      (messages ?? []) as ConversationMessageRow[],
    );
  }

  const viewerName = profile?.full_name ?? profile?.display_name ?? (viewerRole === "owner" ? "Owner" : "Traveler");
  const viewerAvatarUrl = normalizeImageUrl(
    profile?.avatar_url,
    viewerRole === "owner" ? "/owner-selfie-ahmed-reference.png" : devProfile.avatarUrl,
  );

  const conversations = summaryRows.map((summary) => {
    const messages = (messageRowsByConversation.get(summary.conversation_id) ?? []).map((row) =>
      mapMessage(row, user.id, viewerName, viewerAvatarUrl),
    );
    const lastPreview = buildLastPreview(messages, summary);
    const property = mapProperty(summary);

    return {
      bookingId: summary.booking_id,
      id: summary.conversation_id,
      isTyping: false,
      messages: lastPreview && messages.length === 0 ? [lastPreview] : messages,
      participant: {
        avatarUrl: normalizeImageUrl(summary.participant_avatar_url, marketplaceImages.host),
        id: summary.participant_id,
        isOnline: false,
        name: summary.participant_name ?? "Conversation participant",
        role: summary.participant_role === "traveler" ? "traveler" : "owner",
        verified: summary.participant_verified,
      },
      property,
      unreadCount: Number(summary.unread_count ?? 0),
      updatedAt: summary.last_message_at ?? summary.conversation_updated_at,
    } satisfies TravelerConversation;
  });

  const selectedConversation =
    conversations.find((conversation) => conversation.id === preferredConversationId)
    ?? conversations.find((conversation) => conversation.id === selectedConversationId)
    ?? conversations[0]
    ?? null;

  return {
    conversations,
    selectedConversation,
  };
}

function buildOwnerFallbackConversation(): TravelerConversation[] {
  const ownerPerspectiveProperty = devProperties[0];

  return devConversations
    .filter((conversation) => conversation.participant.role === "owner")
    .map((conversation) => ({
      ...conversation,
      messages: conversation.messages.map((message) => ({
        ...message,
        isOwn: !message.isOwn,
        senderAvatarUrl: message.isOwn ? conversation.participant.avatarUrl : "/owner-selfie-ahmed-reference.png",
        senderId: message.isOwn ? conversation.participant.id : "owner-fallback",
        senderName: message.isOwn ? conversation.participant.name : "Ahmed Hassan",
      })),
      participant: {
        avatarUrl: devProfile.avatarUrl,
        id: devProfile.id,
        isOnline: false,
        name: devProfile.fullName,
        role: "traveler",
        verified: true,
      },
      property: {
        ...ownerPerspectiveProperty,
        id: conversation.property.id,
        title: conversation.property.title,
      },
    }));
}

function getFallbackMessagingData(
  viewerRole: ViewerRole,
  selectedConversationId?: string,
): MessagingData {
  const conversations = viewerRole === "owner"
    ? buildOwnerFallbackConversation()
    : devConversations;
  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedConversationId)
    ?? conversations[0]
    ?? null;

  return {
    conversations,
    selectedConversation,
  };
}

export async function getMessagingData(
  viewerRole: ViewerRole,
  {
    bookingId,
    selectedConversationId,
  }: {
    bookingId?: string;
    selectedConversationId?: string;
  } = {},
): Promise<MessagingData> {
  if (!getSupabaseConfig() || isDevAuthBypassEnabled()) {
    return getFallbackMessagingData(viewerRole, selectedConversationId);
  }

  return getSupabaseMessagingData(viewerRole, selectedConversationId, bookingId);
}

export async function getMessagingUnreadCount(viewerRole: ViewerRole) {
  const data = await getMessagingData(viewerRole);
  return data.conversations.reduce((total, conversation) => total + conversation.unreadCount, 0);
}
