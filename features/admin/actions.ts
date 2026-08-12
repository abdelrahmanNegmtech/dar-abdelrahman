"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Database } from "@/lib/supabase/database.types";
import { requireAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

type ActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

const moderatePropertySchema = z.object({
  propertyId: z.string().uuid(),
  status: z.enum(["approved", "rejected", "suspended"]),
  note: z.string().trim().max(500).optional(),
});

const reviewVerificationSchema = z.object({
  notes: z.string().trim().max(500).optional(),
  reason: z.enum([
    "document_missing",
    "document_unreadable",
    "name_mismatch",
    "address_mismatch",
    "business_record_invalid",
    "tax_record_invalid",
    "duplicate_submission",
    "manual_review_required",
    "other",
  ]).optional(),
  status: z.enum(["approved", "rejected"]),
  verificationId: z.string().uuid(),
});

const profileActiveSchema = z.object({
  active: z.boolean(),
  profileId: z.string().uuid(),
});

type ModeratePropertyStatus = z.infer<typeof moderatePropertySchema>["status"];
type VerificationReviewStatus = z.infer<typeof reviewVerificationSchema>["status"];

function revalidateAdminPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/properties");
  revalidatePath("/admin/users");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/reports");
}

export async function moderatePropertyAction(input: {
  propertyId: string;
  status: ModeratePropertyStatus;
  note?: string;
}): Promise<ActionResult> {
  const parsed = moderatePropertySchema.safeParse(input);

  if (!parsed.success) {
    return { message: "Please review the property moderation details and try again.", ok: false };
  }

  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_moderate_property", {
    admin_note: parsed.data.note,
    property_uuid: parsed.data.propertyId,
    target_status: parsed.data.status,
  });

  if (error) {
    return { message: "We could not save that moderation decision right now.", ok: false };
  }

  revalidateAdminPaths();
  revalidatePath(`/owner/properties/${parsed.data.propertyId}`);

  return {
    message:
      parsed.data.status === "approved"
        ? "Property approved."
        : parsed.data.status === "rejected"
          ? "Property rejected."
          : "Property suspended.",
    ok: true,
  };
}

export async function reviewOwnerVerificationAction(input: {
  notes?: string;
  reason?: Database["public"]["Enums"]["verification_rejection_reason"];
  status: VerificationReviewStatus;
  verificationId: string;
}): Promise<ActionResult> {
  const parsed = reviewVerificationSchema.safeParse(input);

  if (!parsed.success) {
    return { message: "Please review the verification decision and try again.", ok: false };
  }

  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_review_owner_verification", {
    rejection_reason_input: parsed.data.reason,
    review_notes_input: parsed.data.notes,
    target_status: parsed.data.status,
    verification_uuid: parsed.data.verificationId,
  });

  if (error) {
    return { message: "We could not save that verification decision right now.", ok: false };
  }

  revalidateAdminPaths();
  revalidatePath("/owner/verification");

  return {
    message: parsed.data.status === "approved" ? "Owner verification approved." : "Owner verification rejected.",
    ok: true,
  };
}

export async function setProfileActiveAction(input: {
  active: boolean;
  profileId: string;
}): Promise<ActionResult> {
  const parsed = profileActiveSchema.safeParse(input);

  if (!parsed.success) {
    return { message: "Please review the account state change and try again.", ok: false };
  }

  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_profile_active", {
    active: parsed.data.active,
    profile_uuid: parsed.data.profileId,
  });

  if (error) {
    return { message: "We could not update that account state right now.", ok: false };
  }

  revalidateAdminPaths();

  return {
    message: parsed.data.active ? "Account reactivated." : "Account suspended.",
    ok: true,
  };
}
