import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { submitOwnerPropertyForReview } from "@/features/properties/data/owner-property-actions";

function mapStatusLabel(
  moderationStatus: string,
  publicationStatus: string,
) {
  if (publicationStatus === "published" && moderationStatus === "approved") {
    return "published";
  }

  if (moderationStatus === "submitted" || moderationStatus === "under_review") {
    return "pending_review";
  }

  if (moderationStatus === "approved") {
    return "approved";
  }

  if (moderationStatus === "rejected") {
    return "rejected";
  }

  if (moderationStatus === "suspended") {
    return "suspended";
  }

  return "draft";
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await submitOwnerPropertyForReview(id);

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  return NextResponse.json({ id: result.data.propertyId, status: result.data.status });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireOwner();

  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("id, moderation_status, publication_status")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }

  return NextResponse.json({
    id: data.id,
    status: mapStatusLabel(data.moderation_status, data.publication_status),
  });
}
