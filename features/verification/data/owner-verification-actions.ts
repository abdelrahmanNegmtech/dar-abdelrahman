"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOwner } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type VerificationRow = Database["public"]["Tables"]["owner_verifications"]["Row"];
type VerificationInsert = Database["public"]["Tables"]["owner_verifications"]["Insert"];
type VerificationUpdate = Database["public"]["Tables"]["owner_verifications"]["Update"];
type VerificationDocumentRow = Database["public"]["Tables"]["owner_verification_documents"]["Row"];
type VerificationDocumentInsert = Database["public"]["Tables"]["owner_verification_documents"]["Insert"];
type VerificationDocumentUpdate = Database["public"]["Tables"]["owner_verification_documents"]["Update"];
type VerificationStatus = Database["public"]["Enums"]["verification_status"];
type VerificationType = Database["public"]["Enums"]["owner_verification_type"];
type VerificationDocumentType = Database["public"]["Enums"]["verification_document_type"];
type DocumentReviewStatus = Database["public"]["Enums"]["document_review_status"];

type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | { ok: false; message: string };

const verificationDraftSchema = z.object({
  businessName: z.string().trim().max(200).optional(),
  businessRegistrationNumber: z.string().trim().max(200).optional(),
  dateOfBirth: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  legalFullName: z.string().trim().max(200).optional(),
  taxIdentifier: z.string().trim().max(200).optional(),
  verificationType: z.enum(["individual", "business"]),
});

const verificationDocumentSchema = z.object({
  documentType: z.enum([
    "national_id_front",
    "national_id_back",
    "passport",
    "selfie",
    "property_deed",
    "rental_authorization",
    "utility_bill",
    "business_registration",
    "tax_document",
    "other",
  ]),
  fileSizeBytes: z.number().int().positive().max(10 * 1024 * 1024),
  mimeType: z.enum(["application/pdf", "image/jpeg", "image/png"]),
  originalFileName: z.string().trim().min(1).max(255),
  storagePath: z.string().trim().min(1).max(1024),
  verificationId: z.string().uuid(),
});

const submitVerificationSchema = z.object({
  verificationId: z.string().uuid(),
});

function fail<T = undefined>(message: string): ActionResult<T> {
  return { message, ok: false };
}

function ok<T>(data: T, message?: string): ActionResult<T> {
  return { data, message, ok: true };
}

function revalidateOwnerVerificationPaths() {
  revalidatePath("/owner/verification");
}

async function getLatestOwnerVerification(profileId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("owner_verifications")
    .select("id, owner_profile_id, verification_type, status, legal_full_name, business_name, business_registration_number, tax_identifier, date_of_birth, review_notes, rejection_reason_code, submitted_at, under_review_at, approved_at, rejected_at, reviewed_by_profile_id, deleted_at, created_at, updated_at")
    .eq("owner_profile_id", profileId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load owner verification.");
  }

  return (data as VerificationRow | null) ?? null;
}

function buildDraftPayload(
  input: z.infer<typeof verificationDraftSchema>,
  verificationType: VerificationType,
): VerificationInsert | VerificationUpdate {
  return {
    business_name: input.businessName?.trim() || null,
    business_registration_number: input.businessRegistrationNumber?.trim() || null,
    date_of_birth: input.dateOfBirth?.trim() || null,
    legal_full_name: input.legalFullName?.trim() || null,
    tax_identifier: input.taxIdentifier?.trim() || null,
    verification_type: verificationType,
  };
}

function canReuseVerification(status: VerificationStatus) {
  return status === "draft" || status === "not_started";
}

function requiresNewDraft(status: VerificationStatus) {
  return status === "rejected" || status === "expired";
}

async function persistVerificationDraft(input: z.infer<typeof verificationDraftSchema>) {
  const { profile } = await requireOwner();
  const supabase = await createClient();
  const latest = await getLatestOwnerVerification(profile.id);
  const payload = buildDraftPayload(input, input.verificationType);

  if (!latest) {
    const insertPayload: VerificationInsert = {
      ...payload,
      owner_profile_id: profile.id,
      status: "draft",
      verification_type: input.verificationType,
    };
    const { data, error } = await supabase
      .from("owner_verifications")
      .insert(insertPayload)
      .select("id, status")
      .single();

    if (error || !data) {
      return fail<{ createdNewAttempt: boolean; status: VerificationStatus; verificationId: string }>(
        "We could not save your verification draft right now.",
      );
    }

    revalidateOwnerVerificationPaths();
    return ok(
      {
        createdNewAttempt: true,
        status: data.status,
        verificationId: data.id,
      },
      "Verification draft saved.",
    );
  }

  if (latest.status === "submitted" || latest.status === "under_review") {
    return fail<{ createdNewAttempt: boolean; status: VerificationStatus; verificationId: string }>(
      "Your verification is already in review and cannot be edited right now.",
    );
  }

  if (latest.status === "approved") {
    return fail<{ createdNewAttempt: boolean; status: VerificationStatus; verificationId: string }>(
      "Your verification is already approved.",
    );
  }

  if (canReuseVerification(latest.status)) {
    const { data, error } = await supabase
      .from("owner_verifications")
      .update({
        ...payload,
        status: "draft",
      })
      .eq("id", latest.id)
      .eq("owner_profile_id", profile.id)
      .is("deleted_at", null)
      .select("id, status")
      .single();

    if (error || !data) {
      return fail<{ createdNewAttempt: boolean; status: VerificationStatus; verificationId: string }>(
        "We could not save your verification draft right now.",
      );
    }

    revalidateOwnerVerificationPaths();
    return ok(
      {
        createdNewAttempt: false,
        status: data.status,
        verificationId: data.id,
      },
      "Verification draft saved.",
    );
  }

  if (requiresNewDraft(latest.status)) {
    const insertPayload: VerificationInsert = {
      business_name: payload.business_name ?? latest.business_name,
      business_registration_number:
        payload.business_registration_number ?? latest.business_registration_number,
      date_of_birth: payload.date_of_birth ?? latest.date_of_birth,
      legal_full_name: payload.legal_full_name ?? latest.legal_full_name,
      owner_profile_id: profile.id,
      status: "draft",
      tax_identifier: payload.tax_identifier ?? latest.tax_identifier,
      verification_type: input.verificationType,
    };

    const { data, error } = await supabase
      .from("owner_verifications")
      .insert(insertPayload)
      .select("id, status")
      .single();

    if (error || !data) {
      return fail<{ createdNewAttempt: boolean; status: VerificationStatus; verificationId: string }>(
        "We could not create a new verification draft right now.",
      );
    }

    revalidateOwnerVerificationPaths();
    return ok(
      {
        createdNewAttempt: true,
        status: data.status,
        verificationId: data.id,
      },
      "A new verification draft was created from your previous attempt.",
    );
  }

  return fail<{ createdNewAttempt: boolean; status: VerificationStatus; verificationId: string }>(
    "This verification cannot be edited right now.",
  );
}

async function getOwnedVerification(
  verificationId: string,
  profileId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("owner_verifications")
    .select("id, owner_profile_id, verification_type, status, legal_full_name, business_name, business_registration_number, tax_identifier, date_of_birth, review_notes, rejection_reason_code, submitted_at, under_review_at, approved_at, rejected_at, reviewed_by_profile_id, deleted_at, created_at, updated_at")
    .eq("id", verificationId)
    .eq("owner_profile_id", profileId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load owner verification.");
  }

  return (data as VerificationRow | null) ?? null;
}

function buildExpectedDocumentPathPrefix(userId: string, verificationId: string) {
  return `${userId}/${verificationId}/`;
}

async function getActiveVerificationDocuments(verificationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("owner_verification_documents")
    .select("id, owner_verification_id, document_type, storage_path, original_file_name, mime_type, file_size_bytes, review_status, rejection_reason, uploaded_by_profile_id, deleted_at, created_at, updated_at")
    .eq("owner_verification_id", verificationId)
    .is("deleted_at", null);

  if (error) {
    throw new Error("Unable to load verification documents.");
  }

  return (data ?? []) as VerificationDocumentRow[];
}

function isUsableDocumentStatus(status: DocumentReviewStatus) {
  return status === "pending" || status === "approved";
}

export async function saveOwnerVerificationDraft(input: unknown) {
  const parsed = verificationDraftSchema.safeParse(input);

  if (!parsed.success) {
    return fail<{ createdNewAttempt: boolean; status: VerificationStatus; verificationId: string }>(
      "Please review the verification details and try again.",
    );
  }

  return persistVerificationDraft(parsed.data);
}

export async function saveOwnerVerificationDocumentMetadata(input: unknown) {
  const parsed = verificationDocumentSchema.safeParse(input);

  if (!parsed.success) {
    return fail<{ replacedStoragePath: string | null; verificationId: string }>(
      "Please review the uploaded document details and try again.",
    );
  }

  const { profile, user } = await requireOwner();
  const verification = await getOwnedVerification(parsed.data.verificationId, profile.id);

  if (!verification) {
    return fail<{ replacedStoragePath: string | null; verificationId: string }>(
      "We could not find that verification draft.",
    );
  }

  if (!canReuseVerification(verification.status)) {
    return fail<{ replacedStoragePath: string | null; verificationId: string }>(
      "Documents can only be uploaded for an editable verification draft.",
    );
  }

  const expectedPrefix = buildExpectedDocumentPathPrefix(user.id, parsed.data.verificationId);
  if (!parsed.data.storagePath.startsWith(expectedPrefix)) {
    return fail<{ replacedStoragePath: string | null; verificationId: string }>(
      "Document storage paths must follow the approved user/verification structure.",
    );
  }

  const supabase = await createClient();
  const { data: existingDocument, error: existingError } = await supabase
    .from("owner_verification_documents")
    .select("id, storage_path")
    .eq("owner_verification_id", parsed.data.verificationId)
    .eq("document_type", parsed.data.documentType)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingError) {
    return fail<{ replacedStoragePath: string | null; verificationId: string }>(
      "We could not prepare that document metadata right now.",
    );
  }

  const updatePayload: VerificationDocumentUpdate = {
    file_size_bytes: parsed.data.fileSizeBytes,
    mime_type: parsed.data.mimeType,
    original_file_name: parsed.data.originalFileName,
    rejection_reason: null,
    review_status: "pending",
    storage_path: parsed.data.storagePath,
    uploaded_by_profile_id: profile.id,
  };

  const insertPayload: VerificationDocumentInsert = {
    document_type: parsed.data.documentType,
    file_size_bytes: parsed.data.fileSizeBytes,
    mime_type: parsed.data.mimeType,
    original_file_name: parsed.data.originalFileName,
    owner_verification_id: parsed.data.verificationId,
    rejection_reason: null,
    review_status: "pending",
    storage_path: parsed.data.storagePath,
    uploaded_by_profile_id: profile.id,
  };

  const result = existingDocument
    ? await supabase
        .from("owner_verification_documents")
        .update(updatePayload)
        .eq("id", existingDocument.id)
    : await supabase
        .from("owner_verification_documents")
        .insert(insertPayload);

  if (result.error) {
    return fail<{ replacedStoragePath: string | null; verificationId: string }>(
      "We could not save that document metadata right now.",
    );
  }

  revalidateOwnerVerificationPaths();
  return ok(
    {
      replacedStoragePath:
        existingDocument && existingDocument.storage_path !== parsed.data.storagePath
          ? existingDocument.storage_path
          : null,
      verificationId: parsed.data.verificationId,
    },
    "Document uploaded.",
  );
}

function hasDocumentType(
  documents: VerificationDocumentRow[],
  documentType: VerificationDocumentType,
) {
  return documents.some(
    (document) => document.document_type === documentType && isUsableDocumentStatus(document.review_status),
  );
}

export async function submitOwnerVerification(input: unknown) {
  const parsed = submitVerificationSchema.safeParse(input);

  if (!parsed.success) {
    return fail<{ status: VerificationStatus; verificationId: string }>("Missing verification.");
  }

  const { profile } = await requireOwner();
  const verification = await getOwnedVerification(parsed.data.verificationId, profile.id);

  if (!verification) {
    return fail<{ status: VerificationStatus; verificationId: string }>(
      "We could not find that verification draft.",
    );
  }

  if (verification.status === "submitted" || verification.status === "under_review") {
    return fail<{ status: VerificationStatus; verificationId: string }>(
      "Your verification is already in review.",
    );
  }

  if (verification.status === "approved") {
    return fail<{ status: VerificationStatus; verificationId: string }>(
      "Your verification is already approved.",
    );
  }

  if (!canReuseVerification(verification.status)) {
    return fail<{ status: VerificationStatus; verificationId: string }>(
      "Please save your updates into a fresh verification draft before submitting.",
    );
  }

  const documents = await getActiveVerificationDocuments(verification.id);
  const missing: string[] = [];

  if (!verification.legal_full_name?.trim()) {
    missing.push("legal full name");
  }
  if (!verification.date_of_birth) {
    missing.push("date of birth");
  }
  if (!profile.email) {
    missing.push("profile email");
  }
  if (!profile.phone) {
    missing.push("profile phone number");
  }

  const hasPassport = hasDocumentType(documents, "passport");
  const hasNationalIdFront = hasDocumentType(documents, "national_id_front");
  const hasNationalIdBack = hasDocumentType(documents, "national_id_back");
  if (!hasPassport && !(hasNationalIdFront && hasNationalIdBack)) {
    missing.push("identity document");
  }
  if (!hasDocumentType(documents, "selfie")) {
    missing.push("selfie");
  }
  if (
    !hasDocumentType(documents, "rental_authorization")
    && !hasDocumentType(documents, "property_deed")
    && !hasDocumentType(documents, "utility_bill")
  ) {
    missing.push("ownership or authorization document");
  }

  if (verification.verification_type === "business") {
    if (!verification.business_name?.trim()) {
      missing.push("business name");
    }
    if (!verification.business_registration_number?.trim()) {
      missing.push("business registration number");
    }
    if (
      !hasDocumentType(documents, "business_registration")
      && !hasDocumentType(documents, "tax_document")
    ) {
      missing.push("business registration or tax document");
    }
  }

  if (missing.length) {
    return fail<{ status: VerificationStatus; verificationId: string }>(
      `Please complete the following before submitting: ${missing.join(", ")}.`,
    );
  }

  const supabase = await createClient();
  const submittedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("owner_verifications")
    .update({
      approved_at: null,
      rejected_at: null,
      rejection_reason_code: null,
      review_notes: null,
      reviewed_by_profile_id: null,
      status: "submitted",
      submitted_at: submittedAt,
      under_review_at: null,
    })
    .eq("id", verification.id)
    .eq("owner_profile_id", profile.id)
    .is("deleted_at", null)
    .select("id, status")
    .single();

  if (error || !data) {
    return fail<{ status: VerificationStatus; verificationId: string }>(
      "We could not submit your verification right now.",
    );
  }

  revalidateOwnerVerificationPaths();
  return ok(
    {
      status: data.status,
      verificationId: data.id,
    },
    "Verification submitted.",
  );
}
