import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import type { Profile } from "@/lib/supabase/auth";
import { requireOwner } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getOwnerProperties, type OwnerPropertyListItem } from "@/features/properties/data/owner-property-queries";
import type { Database } from "@/lib/supabase/database.types";

type VerificationRow = Database["public"]["Tables"]["owner_verifications"]["Row"];
type VerificationDocumentRow = Database["public"]["Tables"]["owner_verification_documents"]["Row"];
type VerificationStatus = Database["public"]["Enums"]["verification_status"];
type VerificationType = Database["public"]["Enums"]["owner_verification_type"];
type VerificationDocumentType = Database["public"]["Enums"]["verification_document_type"];
type DocumentReviewStatus = Database["public"]["Enums"]["document_review_status"];
type VerificationRejectionReason = Database["public"]["Enums"]["verification_rejection_reason"];

export type OwnerVerificationDocumentViewModel = {
  createdAt: string;
  documentType: VerificationDocumentType;
  fileSizeBytes: number;
  id: string;
  mimeType: string;
  originalFileName: string;
  rejectionReason: string | null;
  reviewStatus: DocumentReviewStatus;
  storagePath: string;
  updatedAt: string;
};

export type OwnerVerificationViewModel = {
  approvedAt: string | null;
  businessName: string;
  businessRegistrationNumber: string;
  canManageDraft: boolean;
  canStartNewAttempt: boolean;
  createdAt: string | null;
  dateOfBirth: string;
  id: string | null;
  isEditable: boolean;
  legalFullName: string;
  rejectionReasonCode: VerificationRejectionReason | null;
  rejectedAt: string | null;
  reviewNotes: string | null;
  status: VerificationStatus;
  statusLabel: string;
  submittedAt: string | null;
  taxIdentifier: string;
  underReviewAt: string | null;
  updatedAt: string | null;
  verificationType: VerificationType;
};

export type OwnerVerificationProfileViewModel = {
  avatarUrl: string | null;
  city: string | null;
  countryName: string | null;
  dateOfBirth: string | null;
  displayName: string | null;
  email: string;
  emailVerified: boolean;
  fullName: string | null;
  id: string;
  identityVerified: boolean;
  nationality: string | null;
  phone: string | null;
  phoneVerified: boolean;
};

export type OwnerVerificationPageData = {
  documents: OwnerVerificationDocumentViewModel[];
  linkedProperties: OwnerPropertyListItem[];
  payoutSection: {
    description: string;
    status: "deferred";
    title: string;
  };
  profile: OwnerVerificationProfileViewModel;
  verification: OwnerVerificationViewModel;
};

function mapStatusLabel(status: VerificationStatus) {
  switch (status) {
    case "approved":
      return "Approved";
    case "draft":
      return "Draft";
    case "expired":
      return "Expired";
    case "rejected":
      return "Rejected";
    case "submitted":
      return "Submitted";
    case "under_review":
      return "Under review";
    default:
      return "Not started";
  }
}

function isEditableStatus(status: VerificationStatus) {
  return status === "not_started" || status === "draft";
}

function canStartNewAttempt(status: VerificationStatus) {
  return status === "rejected" || status === "expired";
}

function mapDocument(row: VerificationDocumentRow): OwnerVerificationDocumentViewModel {
  return {
    createdAt: row.created_at,
    documentType: row.document_type,
    fileSizeBytes: row.file_size_bytes,
    id: row.id,
    mimeType: row.mime_type,
    originalFileName: row.original_file_name,
    rejectionReason: row.rejection_reason,
    reviewStatus: row.review_status,
    storagePath: row.storage_path,
    updatedAt: row.updated_at,
  };
}

function buildProfileViewModel(profile: Profile): OwnerVerificationProfileViewModel {
  return {
    avatarUrl: profile.avatar_url,
    city: profile.city,
    countryName: profile.country_name,
    dateOfBirth: profile.date_of_birth,
    displayName: profile.display_name,
    email: profile.email,
    emailVerified: profile.email_verified,
    fullName: profile.full_name,
    id: profile.id,
    identityVerified: profile.identity_verified,
    nationality: profile.nationality,
    phone: profile.phone,
    phoneVerified: profile.phone_verified,
  };
}

function buildNotStartedVerification(profile: Profile): OwnerVerificationViewModel {
  return {
    approvedAt: null,
    businessName: "",
    businessRegistrationNumber: "",
    canManageDraft: true,
    canStartNewAttempt: false,
    createdAt: null,
    dateOfBirth: profile.date_of_birth ?? "",
    id: null,
    isEditable: true,
    legalFullName: profile.full_name ?? "",
    rejectionReasonCode: null,
    rejectedAt: null,
    reviewNotes: null,
    status: "not_started",
    statusLabel: mapStatusLabel("not_started"),
    submittedAt: null,
    taxIdentifier: "",
    underReviewAt: null,
    updatedAt: null,
    verificationType: "individual",
  };
}

function mapVerification(row: VerificationRow): OwnerVerificationViewModel {
  return {
    approvedAt: row.approved_at,
    businessName: row.business_name ?? "",
    businessRegistrationNumber: row.business_registration_number ?? "",
    canManageDraft: isEditableStatus(row.status) || canStartNewAttempt(row.status),
    canStartNewAttempt: canStartNewAttempt(row.status),
    createdAt: row.created_at,
    dateOfBirth: row.date_of_birth ?? "",
    id: row.id,
    isEditable: isEditableStatus(row.status),
    legalFullName: row.legal_full_name ?? "",
    rejectionReasonCode: row.rejection_reason_code,
    rejectedAt: row.rejected_at,
    reviewNotes: row.review_notes,
    status: row.status,
    statusLabel: mapStatusLabel(row.status),
    submittedAt: row.submitted_at,
    taxIdentifier: row.tax_identifier ?? "",
    underReviewAt: row.under_review_at,
    updatedAt: row.updated_at,
    verificationType: row.verification_type,
  };
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

async function getVerificationDocuments(verificationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("owner_verification_documents")
    .select("id, owner_verification_id, document_type, storage_path, original_file_name, mime_type, file_size_bytes, review_status, rejection_reason, uploaded_by_profile_id, deleted_at, created_at, updated_at")
    .eq("owner_verification_id", verificationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load verification documents.");
  }

  return ((data ?? []) as VerificationDocumentRow[]).map(mapDocument);
}

export async function getOwnerVerificationPageData(): Promise<OwnerVerificationPageData> {
  noStore();

  const { profile } = await requireOwner();
  const [verificationRow, linkedProperties] = await Promise.all([
    getLatestOwnerVerification(profile.id),
    getOwnerProperties(),
  ]);

  const documents = verificationRow ? await getVerificationDocuments(verificationRow.id) : [];

  return {
    documents,
    linkedProperties,
    payoutSection: {
      description:
        "Owner payout destination details are managed through the separate payouts workflow and are not persisted on verification records in this phase.",
      status: "deferred",
      title: "Payout method integration is deferred",
    },
    profile: buildProfileViewModel(profile),
    verification: verificationRow ? mapVerification(verificationRow) : buildNotStartedVerification(profile),
  };
}
