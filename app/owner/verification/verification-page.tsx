"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle,
  ChevronRight,
  Clock3,
  FileBadge,
  Headphones,
  Hotel,
  Info,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  Upload,
  UserRound,
  XCircle,
} from "lucide-react";
import { Card, OwnerShell } from "@/components/owner/owner-shell";
import {
  saveOwnerVerificationDocumentMetadata,
  saveOwnerVerificationDraft,
  submitOwnerVerification,
} from "@/features/verification/data/owner-verification-actions";
import type {
  OwnerVerificationDocumentViewModel,
  OwnerVerificationPageData,
} from "@/features/verification/data/owner-verification-queries";
import { createClient } from "@/lib/supabase/client";

type VerificationType = "individual" | "business";
type VerificationDocumentType =
  | "national_id_front"
  | "national_id_back"
  | "passport"
  | "selfie"
  | "property_deed"
  | "rental_authorization"
  | "utility_bill"
  | "business_registration"
  | "tax_document"
  | "other";

type OwnerTypeOption = {
  description: string;
  title: string;
  verificationType: VerificationType;
  icon: typeof UserRound;
};

type FormState = {
  businessName: string;
  businessRegistrationNumber: string;
  dateOfBirth: string;
  legalFullName: string;
  ownerType: string;
  taxIdentifier: string;
  verificationType: VerificationType;
};

const ownerTypeOptions: OwnerTypeOption[] = [
  {
    description: "I own and manage my properties.",
    icon: UserRound,
    title: "Individual owner",
    verificationType: "individual",
  },
  {
    description: "I represent property owners and list for them.",
    icon: BriefcaseBusiness,
    title: "Broker / real estate agent",
    verificationType: "business",
  },
  {
    description: "My company manages multiple properties.",
    icon: Building2,
    title: "Agency / company",
    verificationType: "business",
  },
  {
    description: "I operate hotels or serviced apartments.",
    icon: Hotel,
    title: "Hotel / serviced apartment operator",
    verificationType: "business",
  },
] as const;

const acceptedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
const maxUploadBytes = 10 * 1024 * 1024;
const bucketName = "owner-verification-documents";

function inferOwnerType(verificationType: VerificationType) {
  return verificationType === "business" ? "Agency / company" : "Individual owner";
}

function buildInitialForm(data: OwnerVerificationPageData): FormState {
  return {
    businessName: data.verification.businessName,
    businessRegistrationNumber: data.verification.businessRegistrationNumber,
    dateOfBirth: data.verification.dateOfBirth || data.profile.dateOfBirth?.slice(0, 10) || "",
    legalFullName: data.verification.legalFullName || data.profile.fullName || "",
    ownerType: inferOwnerType(data.verification.verificationType),
    taxIdentifier: data.verification.taxIdentifier,
    verificationType: data.verification.verificationType,
  };
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatShortDate(value: string | null) {
  if (!value) {
    return "Pending";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatFileSize(fileSizeBytes: number) {
  if (fileSizeBytes >= 1024 * 1024) {
    return `${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(fileSizeBytes / 1024))} KB`;
}

function humanizeEnum(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return value
    .split("_")
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

function buildSafeFilename(originalFileName: string) {
  const extensionMatch = originalFileName.toLowerCase().match(/\.(pdf|jpg|jpeg|png)$/);
  const extension = extensionMatch?.[0] ?? "";
  const baseName = originalFileName
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "verification-document";

  return `${baseName}-${crypto.randomUUID().slice(0, 8)}${extension}`;
}

function getDocumentMap(documents: OwnerVerificationDocumentViewModel[]) {
  return new Map<VerificationDocumentType, OwnerVerificationDocumentViewModel>(
    documents.map((document) => [document.documentType, document]),
  );
}

function isUsableDocument(
  document: OwnerVerificationDocumentViewModel | undefined,
) {
  return document?.reviewStatus === "pending" || document?.reviewStatus === "approved";
}

function hasUsableDocument(
  documents: Map<VerificationDocumentType, OwnerVerificationDocumentViewModel>,
  documentType: VerificationDocumentType,
) {
  return isUsableDocument(documents.get(documentType));
}

function hasUsableIdentityDocument(
  documents: Map<VerificationDocumentType, OwnerVerificationDocumentViewModel>,
) {
  return hasUsableDocument(documents, "passport")
    || (
      hasUsableDocument(documents, "national_id_front")
      && hasUsableDocument(documents, "national_id_back")
    );
}

function hasUsableOwnershipDocument(
  documents: Map<VerificationDocumentType, OwnerVerificationDocumentViewModel>,
) {
  return hasUsableDocument(documents, "rental_authorization")
    || hasUsableDocument(documents, "property_deed")
    || hasUsableDocument(documents, "utility_bill");
}

function hasUsableBusinessDocument(
  documents: Map<VerificationDocumentType, OwnerVerificationDocumentViewModel>,
) {
  return hasUsableDocument(documents, "business_registration")
    || hasUsableDocument(documents, "tax_document");
}

function getIdentityReviewDocument(
  documents: Map<VerificationDocumentType, OwnerVerificationDocumentViewModel>,
) {
  return (
    documents.get("passport")
    ?? documents.get("national_id_front")
    ?? documents.get("national_id_back")
    ?? null
  );
}

function getEditabilityMessage(data: OwnerVerificationPageData) {
  if (data.verification.status === "approved") {
    return "This approved verification is read-only in the owner portal.";
  }

  if (data.verification.status === "submitted" || data.verification.status === "under_review") {
    return "This verification is currently read-only while DAR reviews it.";
  }

  if (data.verification.canStartNewAttempt) {
    return "You can correct the details below. Saving will create a fresh draft attempt from this record.";
  }

  return "This draft can be updated and submitted from the owner portal.";
}

function getMissingRequirements(
  profile: OwnerVerificationPageData["profile"],
  documents: Map<VerificationDocumentType, OwnerVerificationDocumentViewModel>,
  form: FormState,
) {
  const missing: string[] = [];

  if (!form.legalFullName.trim()) {
    missing.push("Full legal name");
  }
  if (!form.dateOfBirth) {
    missing.push("Date of birth");
  }
  if (!profile.email) {
    missing.push("Profile email");
  }
  if (!profile.phone) {
    missing.push("Profile phone number");
  }

  if (!hasUsableIdentityDocument(documents)) {
    missing.push("Passport or both sides of a national ID");
  }
  if (!hasUsableDocument(documents, "selfie")) {
    missing.push("Selfie verification");
  }
  if (!hasUsableOwnershipDocument(documents)) {
    missing.push("Rental authorization, property deed, or utility bill");
  }

  if (form.verificationType === "business") {
    if (!form.businessName.trim()) {
      missing.push("Business name");
    }
    if (!form.businessRegistrationNumber.trim()) {
      missing.push("Business registration number");
    }
    if (!hasUsableBusinessDocument(documents)) {
      missing.push("Business registration or tax document");
    }
  }

  return missing;
}

function getCompletionPercent(
  profile: OwnerVerificationPageData["profile"],
  documents: Map<VerificationDocumentType, OwnerVerificationDocumentViewModel>,
  form: FormState,
) {
  const items = [
    Boolean(form.legalFullName.trim()),
    Boolean(form.dateOfBirth),
    Boolean(profile.email),
    Boolean(profile.phone),
    hasUsableIdentityDocument(documents),
    hasUsableDocument(documents, "selfie"),
    hasUsableOwnershipDocument(documents),
  ];

  if (form.verificationType === "business") {
    items.push(Boolean(form.businessName.trim()));
    items.push(Boolean(form.businessRegistrationNumber.trim()));
    items.push(hasUsableBusinessDocument(documents));
  }

  const complete = items.filter(Boolean).length;
  return Math.round((complete / items.length) * 100);
}

function getLatestStatusTimestamp(data: OwnerVerificationPageData) {
  return (
    data.verification.approvedAt
    ?? data.verification.rejectedAt
    ?? data.verification.underReviewAt
    ?? data.verification.submittedAt
    ?? data.verification.updatedAt
    ?? data.verification.createdAt
    ?? null
  );
}

function getVerificationTone(status: OwnerVerificationPageData["verification"]["status"]) {
  if (status === "approved") {
    return "bg-[#e9f7ee] text-[#168446]";
  }
  if (status === "submitted" || status === "under_review") {
    return "bg-[#fff5df] text-[#d98100]";
  }
  if (status === "rejected" || status === "expired") {
    return "bg-[#fdebed] text-[#d84955]";
  }
  return "bg-[#f3efff] text-[#5b2be0]";
}

function getDocumentTone(status: OwnerVerificationDocumentViewModel["reviewStatus"]) {
  if (status === "approved") {
    return "bg-[#e9f7ee] text-[#168446]";
  }
  if (status === "rejected" || status === "needs_resubmission") {
    return "bg-[#fdebed] text-[#d84955]";
  }
  return "bg-[#fff5df] text-[#d98100]";
}

function createDraftPayload(form: FormState) {
  return {
    businessName: form.businessName,
    businessRegistrationNumber: form.businessRegistrationNumber,
    dateOfBirth: form.dateOfBirth,
    legalFullName: form.legalFullName,
    taxIdentifier: form.taxIdentifier,
    verificationType: form.verificationType,
  };
}

function getFormStateKey(data: OwnerVerificationPageData) {
  return JSON.stringify({
    businessName: data.verification.businessName,
    businessRegistrationNumber: data.verification.businessRegistrationNumber,
    dateOfBirth: data.verification.dateOfBirth,
    fullName: data.verification.legalFullName,
    profileDateOfBirth: data.profile.dateOfBirth,
    profileFullName: data.profile.fullName,
    status: data.verification.status,
    taxIdentifier: data.verification.taxIdentifier,
    updatedAt: data.verification.updatedAt,
    verificationId: data.verification.id,
    verificationType: data.verification.verificationType,
  });
}

export default function VerificationPage({ data }: { data: OwnerVerificationPageData }) {
  return <VerificationPageContent key={getFormStateKey(data)} data={data} />;
}

function VerificationPageContent({ data }: { data: OwnerVerificationPageData }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => buildInitialForm(data));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const documents = getDocumentMap(data.documents);
  const identityReviewDocument = getIdentityReviewDocument(documents);
  const missingRequirements = getMissingRequirements(data.profile, documents, form);
  const completionPercent = getCompletionPercent(data.profile, documents, form);
  const canManageDraft = data.verification.canManageDraft;

  const runAction = (actionName: string, task: () => Promise<void>) => {
    setError(null);
    setFeedback(null);
    startTransition(async () => {
      setPendingAction(actionName);
      try {
        await task();
      } catch {
        setError("We could not complete that verification action right now.");
      } finally {
        setPendingAction(null);
      }
    });
  };

  const handleSaveDraft = () => {
    runAction("save", async () => {
      const result = await saveOwnerVerificationDraft(createDraftPayload(form));
      if (!result.ok) {
        setError(result.message);
        return;
      }

      setFeedback(result.message ?? "Verification draft saved.");
      router.refresh();
    });
  };

  const handleSubmit = () => {
    runAction("submit", async () => {
      const draftResult = await saveOwnerVerificationDraft(createDraftPayload(form));
      if (!draftResult.ok) {
        setError(draftResult.message);
        return;
      }

      const submitResult = await submitOwnerVerification({
        verificationId: draftResult.data.verificationId,
      });
      if (!submitResult.ok) {
        setError(submitResult.message);
        router.refresh();
        return;
      }

      setFeedback(submitResult.message ?? "Verification submitted.");
      router.refresh();
    });
  };

  const handleUpload = (documentType: VerificationDocumentType, file?: File) => {
    if (!file) {
      return;
    }

    runAction(`upload-${documentType}`, async () => {
      if (!acceptedMimeTypes.includes(file.type)) {
        setError("Please upload a PDF, JPG, JPEG, or PNG file.");
        return;
      }
      if (file.size > maxUploadBytes) {
        setError("Please upload a file smaller than 10 MB.");
        return;
      }

      const draftResult = await saveOwnerVerificationDraft(createDraftPayload(form));
      if (!draftResult.ok) {
        setError(draftResult.message);
        return;
      }

      const supabase = createClient({ persistSession: false });
      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        setError("Please sign in again before uploading verification documents.");
        return;
      }

      const verificationId = draftResult.data.verificationId;
      const fileName = buildSafeFilename(file.name);
      const storagePath = `${userData.user.id}/${verificationId}/${fileName}`;
      const uploadResult = await supabase.storage
        .from(bucketName)
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadResult.error) {
        setError(uploadResult.error.message || "We could not upload that document.");
        return;
      }

      const metadataResult = await saveOwnerVerificationDocumentMetadata({
        documentType,
        fileSizeBytes: file.size,
        mimeType: file.type as "application/pdf" | "image/jpeg" | "image/png",
        originalFileName: file.name,
        storagePath,
        verificationId,
      });

      if (!metadataResult.ok) {
        await supabase.storage.from(bucketName).remove([storagePath]);
        setError(metadataResult.message);
        return;
      }

      if (metadataResult.data.replacedStoragePath) {
        await supabase.storage.from(bucketName).remove([metadataResult.data.replacedStoragePath]);
      }

      setFeedback(metadataResult.message ?? "Document uploaded.");
      router.refresh();
    });
  };

  return (
    <OwnerShell
      active="Verification"
      actions={(
        <>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isPending || !canManageDraft}
            className="owner-button-text h-10 rounded-md border border-[#cbd2df] px-7 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendingAction === "save" ? "Saving..." : "Save draft"}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !canManageDraft}
            className="owner-button-text h-10 rounded-md bg-[#5522d9] px-7 text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendingAction === "submit" ? "Submitting..." : "Submit verification"}
          </button>
        </>
      )}
    >
      <div className="owner-dashboard-content">
        <h1 className="owner-page-title">Owner verification</h1>
        <p className="owner-page-description text-[#59637d]">
          Verify your identity and ownership permissions before your listings go live.
        </p>
        {error ? (
          <div className="owner-body mt-4 rounded-lg border border-[#f2c7cd] bg-[#fff6f7] px-4 py-3 text-[#a13d49]">
            {error}
          </div>
        ) : null}
        {feedback ? (
          <div className="owner-body mt-4 rounded-lg border border-[#d8e9dd] bg-[#f4fbf6] px-4 py-3 text-[#1f7a45]">
            {feedback}
          </div>
        ) : null}

        <Card className="mt-6 grid grid-cols-4 divide-x divide-[#e4e7ee] px-6 py-5 max-[1050px]:grid-cols-2 max-[1050px]:gap-y-6 max-[560px]:grid-cols-1 max-[560px]:divide-x-0">
          <Stat label="Status">
            <span className={`owner-badge inline-flex rounded-full px-3 py-1 ${getVerificationTone(data.verification.status)}`}>
              {data.verification.statusLabel}
            </span>
            <p className="owner-helper mt-2 text-[#68718a]">
              {getEditabilityMessage(data)}
            </p>
          </Stat>
          <Stat label="Progress">
            <b className="owner-number-md">
              {completionPercent}% <span className="owner-helper">complete</span>
            </b>
            <div className="mt-3 h-1.5 rounded bg-[#e8e9ee]">
              <div className="h-full rounded bg-[#5522d9]" style={{ width: `${completionPercent}%` }} />
            </div>
          </Stat>
          <Stat label="Latest update">
            <b className="owner-number-sm flex items-center gap-2">
              <Clock3 aria-hidden="true" size={15} strokeWidth={1.8} />
              {formatDateTime(getLatestStatusTimestamp(data))}
            </b>
            <p className="owner-helper mt-2">Timeline dates are derived from your real verification record.</p>
          </Stat>
          <Stat label="Required before submission">
            <div className="owner-helper space-y-2">
              <p className="flex gap-2"><UserRound aria-hidden="true" size={15} />Identity details</p>
              <p className="flex gap-2"><FileBadge aria-hidden="true" size={15} />Verification documents</p>
              <p className="flex gap-2"><ShieldCheck aria-hidden="true" size={15} />Owner review submission</p>
            </div>
          </Stat>
        </Card>

        <div className="mt-5 grid grid-cols-[minmax(0,1.28fr)_minmax(0,1.05fr)_minmax(280px,.55fr)] gap-[18px] max-[1250px]:grid-cols-2 max-[760px]:grid-cols-1">
          <div className="space-y-4">
            <Card className="p-5">
              <Title n="1" text="Owner type" sub="Select the type of account that best describes you." />
              <OwnerTypeOptions
                value={form.ownerType}
                disabled={!canManageDraft || isPending}
                onChange={(ownerType, verificationType) => setForm((current) => ({
                  ...current,
                  ownerType,
                  verificationType,
                }))}
              />
              <p className="owner-helper mt-3 text-[#59637d]">
                Business-style accounts such as brokers, agencies, and operators are submitted as business verifications.
              </p>
            </Card>

            <Card className="p-5">
              <Title
                n="3"
                text="Identity verification"
                sub="Upload a passport or both sides of a national ID, plus a selfie verification."
              />
              <div className="mt-4 grid grid-cols-2 gap-3 max-[1100px]:grid-cols-1 xl:grid-cols-4">
                <DocumentUploadCard
                  title="National ID front"
                  subtitle="PDF, JPG, or PNG up to 10 MB."
                  document={documents.get("national_id_front")}
                  disabled={!canManageDraft || isPending}
                  pending={pendingAction === "upload-national_id_front"}
                  onSelect={(file) => handleUpload("national_id_front", file)}
                />
                <DocumentUploadCard
                  title="National ID back"
                  subtitle="Upload the reverse side when using a national ID."
                  document={documents.get("national_id_back")}
                  disabled={!canManageDraft || isPending}
                  pending={pendingAction === "upload-national_id_back"}
                  onSelect={(file) => handleUpload("national_id_back", file)}
                />
                <DocumentUploadCard
                  title="Passport"
                  subtitle="Use this instead of a national ID if that is your identity proof."
                  document={documents.get("passport")}
                  disabled={!canManageDraft || isPending}
                  pending={pendingAction === "upload-passport"}
                  onSelect={(file) => handleUpload("passport", file)}
                />
                <DocumentUploadCard
                  title="Selfie verification"
                  subtitle="A clear selfie helps DAR review the identity match."
                  document={documents.get("selfie")}
                  disabled={!canManageDraft || isPending}
                  pending={pendingAction === "upload-selfie"}
                  onSelect={(file) => handleUpload("selfie", file)}
                />
              </div>
              <p className="owner-helper mt-3 text-[#59637d]">
                Upload a passport or both the front and back of a national ID. Rejected or resubmission-requested files do not satisfy submission requirements until replaced.
              </p>
              <div className="mt-4 rounded-md border border-[#dfe3eb] px-4 py-3">
                <b className="owner-label">Identity review details</b>
                <div className="mt-3 grid gap-3 max-[560px]:grid-cols-1 sm:grid-cols-3">
                  <MetaItem label="Legal name">{form.legalFullName || "Not provided yet"}</MetaItem>
                  <MetaItem label="Date of birth">{form.dateOfBirth || "Not provided yet"}</MetaItem>
                  <MetaItem label="Document review">
                    {humanizeEnum(identityReviewDocument?.reviewStatus ?? null)}
                  </MetaItem>
                </div>
                <p className="owner-helper mt-3 flex items-center gap-2 text-[#59637d]">
                  <LockKeyhole aria-hidden="true" size={14} strokeWidth={1.8} />
                  Your documents are stored privately and reviewed through DAR&apos;s existing admin workflow.
                </p>
              </div>
            </Card>

            <Card className="p-5">
              <Title
                n="4"
                text="Ownership / authorization documents"
                sub="Provide at least one ownership or authorization document that proves your right to list these properties."
              />
              <div className="mt-4 grid gap-4 max-[560px]:grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                <DocumentUploadCard
                  title="Rental authorization"
                  subtitle="Upload authorization from the owner or rights holder."
                  document={documents.get("rental_authorization")}
                  disabled={!canManageDraft || isPending}
                  pending={pendingAction === "upload-rental_authorization"}
                  onSelect={(file) => handleUpload("rental_authorization", file)}
                />
                <DocumentUploadCard
                  title="Property deed"
                  subtitle="Upload a deed or equivalent ownership evidence."
                  document={documents.get("property_deed")}
                  disabled={!canManageDraft || isPending}
                  pending={pendingAction === "upload-property_deed"}
                  onSelect={(file) => handleUpload("property_deed", file)}
                />
                <DocumentUploadCard
                  title="Utility bill"
                  subtitle="Upload a recent bill that supports the listing address."
                  document={documents.get("utility_bill")}
                  disabled={!canManageDraft || isPending}
                  pending={pendingAction === "upload-utility_bill"}
                  onSelect={(file) => handleUpload("utility_bill", file)}
                />
              </div>
              <p className="owner-helper mt-3 text-[#59637d]">
                At least one of these documents is required. Rejected or resubmission-requested files must be replaced before submission.
              </p>
              <Link
                href="/authorization-template.txt"
                className="owner-button-text mt-4 flex h-9 w-fit min-w-[240px] items-center justify-start gap-2 rounded border border-[#8a64ef] bg-white px-4 text-[#6c4cf5]"
              >
                <Upload aria-hidden="true" size={14} strokeWidth={1.8} />
                Download authorization template
              </Link>
              {form.verificationType === "business" ? (
                <>
                  <div className="mt-5 border-t border-[#e5e8ef] pt-5">
                    <b className="owner-card-title">Business documents</b>
                    <p className="owner-helper mt-2 text-[#59637d]">
                      Business verification requires at least one of these documents.
                    </p>
                    <div className="mt-4 grid gap-4 max-[560px]:grid-cols-1 sm:grid-cols-2">
                      <DocumentUploadCard
                        title="Business registration"
                        subtitle="Upload your company registration or equivalent business record."
                        document={documents.get("business_registration")}
                        disabled={!canManageDraft || isPending}
                        pending={pendingAction === "upload-business_registration"}
                        onSelect={(file) => handleUpload("business_registration", file)}
                      />
                      <DocumentUploadCard
                        title="Tax document"
                        subtitle="Upload a tax record if that is the stronger supporting document."
                        document={documents.get("tax_document")}
                        disabled={!canManageDraft || isPending}
                        pending={pendingAction === "upload-tax_document"}
                        onSelect={(file) => handleUpload("tax_document", file)}
                      />
                    </div>
                  </div>
                </>
              ) : null}
            </Card>

            <Card className="p-5">
              <Title
                n="6"
                text="Compliance and policies"
                sub="These requirements are displayed for reference and are not separately persisted in the current verification schema."
              />
              <div className="owner-helper mt-4 space-y-3 text-[#59637d]">
                <p className="flex gap-2"><CheckCircle aria-hidden="true" size={14} className="mt-0.5 shrink-0 text-[#159447]" />DAR reviews owner identity and document metadata through the existing verification workflow.</p>
                <p className="flex gap-2"><CheckCircle aria-hidden="true" size={14} className="mt-0.5 shrink-0 text-[#159447]" />Only uploaded documents stored in the private verification bucket are considered during review.</p>
                <p className="flex gap-2"><CheckCircle aria-hidden="true" size={14} className="mt-0.5 shrink-0 text-[#159447]" />Profile contact details come from your owner profile and are not duplicated into arbitrary verification fields.</p>
                <p className="flex gap-2"><CheckCircle aria-hidden="true" size={14} className="mt-0.5 shrink-0 text-[#159447]" />False or unreadable documents may lead to rejection or a request for resubmission.</p>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <Title n="2" text="Personal / company details" />
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 max-[560px]:grid-cols-1">
                <Field
                  label="Full legal name"
                  value={form.legalFullName}
                  disabled={!canManageDraft || isPending}
                  onChange={(legalFullName) => setForm((current) => ({ ...current, legalFullName }))}
                />
                <Field label="Display name" value={data.profile.displayName || "Not provided"} readOnly />
                <Field label="Nationality" value={data.profile.nationality || "Not provided"} readOnly />
                <Field
                  label="Date of birth"
                  value={form.dateOfBirth}
                  type="date"
                  disabled={!canManageDraft || isPending}
                  onChange={(dateOfBirth) => setForm((current) => ({ ...current, dateOfBirth }))}
                />
                <Field label="Phone number" value={data.profile.phone || "Not provided"} readOnly />
                <Field label="Email address" value={data.profile.email || "Not provided"} readOnly />
                <Field
                  label="Business name"
                  value={form.businessName}
                  disabled={!canManageDraft || isPending}
                  onChange={(businessName) => setForm((current) => ({ ...current, businessName }))}
                />
                <Field
                  label="Business registration number"
                  value={form.businessRegistrationNumber}
                  disabled={!canManageDraft || isPending}
                  onChange={(businessRegistrationNumber) => setForm((current) => ({
                    ...current,
                    businessRegistrationNumber,
                  }))}
                />
                <Field
                  label="Tax identifier"
                  value={form.taxIdentifier}
                  disabled={!canManageDraft || isPending}
                  onChange={(taxIdentifier) => setForm((current) => ({ ...current, taxIdentifier }))}
                />
                <Field label="City" value={data.profile.city || "Not provided"} readOnly />
                <Field label="Country" value={data.profile.countryName || "Not provided"} readOnly />
              </div>
            </Card>

            <Card className="p-5">
              <Title n="5" text="Payout method" sub="This stays separate from owner verification persistence in the current backend." />
              <div className="mt-4 rounded-lg border border-[#eee5cf] bg-[#fffaf0] px-4 py-4">
                <b className="owner-label">{data.payoutSection.title}</b>
                <p className="owner-helper mt-2 text-[#6f788c]">{data.payoutSection.description}</p>
                <Link
                  href="/owner/payouts"
                  className="owner-button-text mt-4 inline-flex h-9 items-center gap-2 rounded border border-[#8a64ef] px-4 text-[#6c4cf5]"
                >
                  <Landmark aria-hidden="true" size={14} strokeWidth={1.8} />
                  Open payouts
                </Link>
              </div>
            </Card>

            <Card className="p-5">
              <Title n="7" text="Verification timeline" sub="Track your verification progress." />
              <VerificationTimeline data={data} />
            </Card>
          </div>

          <aside className="space-y-[14px] max-[1250px]:col-span-2 max-[760px]:col-span-1">
            <StatusOverviewCard data={data} completionPercent={completionPercent} />
            <MissingRequirements requirements={missingRequirements} />

            <Card className="p-5">
              <b className="owner-card-title">Linked properties</b>
              {data.linkedProperties.length ? (
                data.linkedProperties.map((property) => (
                  <Link
                    href={`/owner/properties/${property.id}`}
                    key={property.id}
                    className="mt-4 flex items-start gap-3 rounded-md border border-[#e5e8ef] px-3 py-3 transition hover:border-[#d5daf0] hover:bg-[#fbfcff]"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-md bg-[#f4f6fb] text-[#5b2be0]">
                      <Building2 aria-hidden="true" size={18} strokeWidth={1.8} />
                    </span>
                    <span className="owner-helper min-w-0 text-[#59637d]">
                      <b className="owner-label block text-[#17213d]">{property.title}</b>
                      {property.location}
                      <small className="owner-badge mt-2 block">{property.statusLabel}</small>
                    </span>
                    <ChevronRight aria-hidden="true" size={14} className="mt-1 shrink-0 text-[#7a849d]" />
                  </Link>
                ))
              ) : (
                <p className="owner-helper mt-4 text-[#59637d]">No linked owner properties yet.</p>
              )}
              <Link href="/owner/properties" className="owner-button-text mt-4 block text-center text-[#5522d9]">
                View all properties
              </Link>
            </Card>

            <Card className="border-[#eee5cf] bg-[#fffaf0] p-5">
              <div className="flex items-center gap-2">
                <Info aria-hidden="true" size={14} strokeWidth={1.8} className="shrink-0 text-[#d58b0a]" />
                <b className="owner-card-title">Admin notes</b>
              </div>
              <div className="mt-3 rounded-md border border-[#f1e1b5] bg-white/60 px-4 py-3">
                <p className="owner-helper text-[#5c4d25]">
                  {data.verification.reviewNotes || "No review notes yet."}
                </p>
                <p className="owner-helper mt-2 text-[#667086]">
                  Latest review status: {data.verification.statusLabel}
                  <br />
                  {formatDateTime(getLatestStatusTimestamp(data))}
                </p>
                {data.verification.rejectionReasonCode ? (
                  <p className="owner-helper mt-2 text-[#a13d49]">
                    Rejection reason: {humanizeEnum(data.verification.rejectionReasonCode)}
                  </p>
                ) : null}
              </div>
            </Card>

            <Card className="p-5">
              <b className="owner-card-title">Need help?</b>
              <p className="owner-helper mt-3">
                Our verification team is here to help you complete the process.
              </p>
              <Link
                href="/owner/help-center"
                className="owner-button-text mt-4 flex h-9 w-full items-center justify-center gap-2 rounded border border-[#8a64ef] bg-white text-[#6c4cf5] transition-colors hover:bg-[#f7f3ff] hover:text-[#6c4cf5]"
              >
                <Headphones aria-hidden="true" size={15} strokeWidth={1.8} className="shrink-0 text-[#6c4cf5]" />
                Contact verification team
              </Link>
            </Card>

            <Card className="p-5">
              <div className="flex gap-3">
                <ShieldCheck aria-hidden="true" size={22} strokeWidth={1.8} className="shrink-0 text-[#5522d9]" />
                <span>
                  <b className="owner-card-title">Your security is our priority</b>
                  <p className="owner-helper mt-2">
                    Your documents stay in a private bucket and are reviewed through DAR admin only.
                  </p>
                </span>
              </div>
            </Card>
          </aside>
        </div>

        <div className="mt-2 flex justify-center gap-4 rounded-lg bg-[#071426] p-4 text-white max-[760px]:flex-col">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isPending || !canManageDraft}
            className="owner-button-text h-10 w-52 rounded border border-white/40 disabled:cursor-not-allowed disabled:opacity-60 max-[760px]:w-full"
          >
            {pendingAction === "save" ? "Saving..." : "Save draft"}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !canManageDraft}
            className="owner-button-text h-10 w-56 rounded bg-[#5522d9] disabled:cursor-not-allowed disabled:opacity-60 max-[760px]:w-full"
          >
            {pendingAction === "submit" ? "Submitting..." : "Submit verification"}
          </button>
          <Link
            href="/owner/help-center"
            className="owner-button-text grid h-10 w-52 place-items-center rounded border border-white/40 max-[760px]:w-full"
          >
            Contact support
          </Link>
        </div>
      </div>
    </OwnerShell>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="px-5 first:pl-0"><p className="owner-helper mb-2">{label}</p>{children}</div>;
}

function Title({ n, text, sub }: { n: string; text: string; sub?: string }) {
  return <><b className="owner-card-title">{n}. {text}</b>{sub ? <p className="owner-helper text-[#626c84]">{sub}</p> : null}</>;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  readOnly = false,
}: {
  disabled?: boolean;
  label: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="owner-label">
      {label}
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className="owner-input-text mt-1 h-9 w-full rounded border border-[#d9dee8] px-3 outline-none focus:border-[#7b4cff] read-only:bg-[#f7f8fb] disabled:cursor-not-allowed disabled:bg-[#f7f8fb]"
      />
    </label>
  );
}

function MetaItem({ label, children }: { children: React.ReactNode; label: string }) {
  return (
    <div className="min-w-0">
      <span className="owner-helper block text-[#59637d]">{label}</span>
      <span className="owner-body mt-1 block break-words">{children}</span>
    </div>
  );
}

function StatusOverviewCard({
  data,
  completionPercent,
}: {
  completionPercent: number;
  data: OwnerVerificationPageData;
}) {
  return (
    <Card className="p-5">
      <b className="owner-card-title">Verification status</b>
      <div className="mt-4 rounded-lg bg-[#f7f3ff] px-4 py-4">
        <span className={`owner-badge inline-flex rounded-full px-3 py-1 ${getVerificationTone(data.verification.status)}`}>
          {data.verification.statusLabel}
        </span>
        <p className="owner-number-sm mt-3">{completionPercent}% complete</p>
        <p className="owner-helper mt-2 text-[#68718a]">
          {data.verification.status === "approved"
            ? "Your owner verification is approved."
            : data.verification.status === "submitted" || data.verification.status === "under_review"
              ? "DAR is reviewing your latest submission."
              : data.verification.status === "rejected" || data.verification.status === "expired"
                ? "Review the notes below, then save to create a fresh corrected draft attempt."
                : "Complete the required details and upload the required documents."}
        </p>
      </div>
    </Card>
  );
}

function MissingRequirements({ requirements }: { requirements: string[] }) {
  return (
    <Card className="p-5">
      <b className="owner-card-title">Missing requirements</b>
      <div className="owner-helper mt-4 space-y-2.5">
        {requirements.length ? (
          requirements.map((requirement) => (
            <p key={requirement} className="grid grid-cols-[14px_minmax(0,1fr)_14px] items-center gap-2">
              <XCircle aria-hidden="true" size={14} strokeWidth={1.9} className="text-[#d84955]" />
              <span className="min-w-0">{requirement}</span>
              <Clock3 aria-hidden="true" size={14} strokeWidth={1.8} className="justify-self-end text-[#ef3447]" />
            </p>
          ))
        ) : (
          <p className="flex items-center gap-2 text-[#159447]">
            <Check aria-hidden="true" size={14} strokeWidth={2} />
            All current submission requirements are complete.
          </p>
        )}
      </div>
    </Card>
  );
}

function VerificationTimeline({ data }: { data: OwnerVerificationPageData }) {
  const hasDraft = Boolean(data.verification.id);
  const isApproved = data.verification.status === "approved";
  const isRejected = data.verification.status === "rejected";
  const isExpired = data.verification.status === "expired";
  const steps = [
    {
      helper: formatShortDate(data.verification.createdAt),
      label: "Verification record",
      state: hasDraft ? "complete" : "pending",
    },
    {
      helper: data.profile.emailVerified && data.profile.phoneVerified ? "Verified" : "Pending",
      label: "Profile contact checks",
      state: data.profile.emailVerified && data.profile.phoneVerified ? "complete" : "pending",
    },
    {
      helper: formatShortDate(data.verification.submittedAt),
      label: "Submitted to DAR",
      state: data.verification.submittedAt ? "complete" : "pending",
    },
    {
      helper: formatShortDate(data.verification.underReviewAt),
      label: "Under review",
      state: data.verification.status === "under_review" ? "active" : data.verification.underReviewAt ? "complete" : "pending",
    },
    {
      helper: isApproved
        ? formatShortDate(data.verification.approvedAt)
        : isRejected
          ? formatShortDate(data.verification.rejectedAt)
          : isExpired
            ? "Expired"
            : "Pending",
      label: isRejected ? "Rejected" : isExpired ? "Expired" : "Final decision",
      state: isApproved || isRejected || isExpired ? "complete" : "pending",
    },
  ] as const;

  return (
    <div className="relative mt-6">
      <span aria-hidden="true" className="absolute left-[10%] top-[13px] h-px w-[30%] bg-[#5b2be0] max-[560px]:hidden" />
      <span aria-hidden="true" className="absolute left-[40%] right-[10%] top-[13px] border-t border-dashed border-[#cfd4de] max-[560px]:hidden" />
      <span aria-hidden="true" className="absolute bottom-[24px] left-[13px] top-[13px] hidden border-l border-dashed border-[#cfd4de] max-[560px]:block" />
      <ol className="relative z-10 grid grid-cols-5 max-[560px]:flex max-[560px]:flex-col max-[560px]:gap-5">
        {steps.map((step) => (
          <li key={step.label} className="min-w-0 text-center max-[560px]:grid max-[560px]:grid-cols-[28px_1fr] max-[560px]:items-start max-[560px]:gap-3 max-[560px]:text-left">
            <span className="flex h-7 items-center justify-center">
              {step.state === "active" ? (
                <span className="grid size-7 place-items-center rounded-full bg-[#e9e2ff] ring-2 ring-[#c7b5ff] shadow-[0_0_0_4px_rgba(108,76,245,.08)]">
                  <span className="grid size-[14px] place-items-center rounded-full bg-[#6c4cf5]">
                    <span className="size-1 rounded-full bg-white" />
                  </span>
                </span>
              ) : (
                <span className={`grid size-6 place-items-center rounded-full ${step.state === "complete" ? "bg-[#5b2be0] text-white" : "bg-[#d8dce5] text-white/80"}`}>
                  <Check aria-hidden="true" size={12} strokeWidth={2.2} />
                </span>
              )}
            </span>
            <span className="mt-2 block max-[560px]:mt-0">
              <span className="owner-badge block leading-[15px] text-[#17213d]">{step.label}</span>
              <span className={`owner-helper mt-1 block ${step.state === "active" ? "text-[#5b2be0]" : "text-[#6d7589]"}`}>{step.helper}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function OwnerTypeOptions({
  value,
  disabled,
  onChange,
}: {
  disabled: boolean;
  onChange: (value: string, verificationType: VerificationType) => void;
  value: string;
}) {
  return (
    <div className="mt-4 grid grid-cols-4 gap-3 max-[1250px]:grid-cols-2 max-[460px]:grid-cols-1">
      {ownerTypeOptions.map(({ title, description, icon: OwnerTypeIcon, verificationType }) => {
        const selected = value === title;

        return (
          <button
            type="button"
            key={title}
            disabled={disabled}
            aria-pressed={selected}
            onClick={() => onChange(title, verificationType)}
            className={`relative flex min-h-[132px] flex-col items-center justify-start rounded-md border px-2 pb-3 pt-4 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#6c4cf5] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${selected ? "border-[#7b4cff] bg-[#faf8ff]" : "border-[#e0e4ec] bg-white"}`}
          >
            {selected ? <span className="absolute right-2 top-2 grid size-[16px] place-items-center rounded-full bg-[#5b2be0] text-white"><Check aria-hidden="true" size={10} strokeWidth={2.4} /></span> : null}
            <OwnerTypeIcon aria-hidden="true" size={22} strokeWidth={1.7} className={`mb-3 shrink-0 ${selected ? "text-[#5b2be0]" : "text-[#11183b]"}`} />
            <span className="owner-label leading-[18px]">{title}</span>
            <span className="owner-helper mt-2 text-[#59637d]">{description}</span>
          </button>
        );
      })}
    </div>
  );
}

function DocumentUploadCard({
  title,
  subtitle,
  document,
  disabled,
  pending,
  onSelect,
}: {
  disabled: boolean;
  document?: OwnerVerificationDocumentViewModel;
  onSelect: (file?: File) => void;
  pending: boolean;
  subtitle: string;
  title: string;
}) {
  return (
    <label className={`relative flex min-h-[174px] cursor-pointer flex-col rounded-md border px-3 pb-3 pt-3 outline-none focus-within:ring-2 focus-within:ring-[#6c4cf5] focus-within:ring-offset-2 ${disabled ? "cursor-not-allowed bg-[#fafbfe]" : "bg-white"} ${document ? "border-[#dfe3eb]" : "border-dashed border-[#cbd2df]"}`}>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        disabled={disabled || pending}
        className="sr-only"
        onChange={(event) => {
          onSelect(event.target.files?.[0]);
          event.currentTarget.value = "";
        }}
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <b className="owner-label block leading-[18px]">{title}</b>
          <p className="owner-helper mt-1 text-[#59637d]">{subtitle}</p>
        </div>
        {document ? (
          <span className={`owner-badge shrink-0 rounded-full px-2 py-[2px] ${getDocumentTone(document.reviewStatus)}`}>
            {humanizeEnum(document.reviewStatus)}
          </span>
        ) : (
          <span className="owner-badge shrink-0 rounded-full bg-[#eef0f4] px-2 py-[2px] text-[#4f586d]">
            Missing
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-1 flex-col justify-center rounded-md border border-[#edf0f5] bg-[#fbfcff] px-4 py-4 text-center">
        <Upload aria-hidden="true" size={24} strokeWidth={1.8} className="mx-auto text-[#6c4cf5]" />
        <p className="owner-helper mt-2 text-[#17213d]">
          {pending ? "Uploading..." : document ? document.originalFileName : "Click to upload"}
        </p>
        <p className="owner-helper mt-1 text-[#6e7892]">
          {document
            ? `${formatFileSize(document.fileSizeBytes)} / ${humanizeEnum(document.reviewStatus)}`
            : "Private upload only"}
        </p>
        {document?.rejectionReason ? (
          <p className="owner-helper mt-2 text-[#a13d49]">{document.rejectionReason}</p>
        ) : null}
      </div>
    </label>
  );
}
