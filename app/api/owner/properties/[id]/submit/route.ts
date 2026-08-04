type PropertyStatus = "draft" | "pending_review" | "approved" | "rejected";

const statuses = new Map<string, PropertyStatus>();

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  statuses.set(id, "pending_review");
  return Response.json({ id, status: "pending_review" as const });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return Response.json({ id, status: statuses.get(id) ?? "pending_review" });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json() as { status?: PropertyStatus };
  if (!body.status || !["draft", "pending_review", "approved", "rejected"].includes(body.status)) {
    return Response.json({ error: "Invalid property status" }, { status: 400 });
  }
  statuses.set(id, body.status);
  return Response.json({ id, status: body.status });
}
