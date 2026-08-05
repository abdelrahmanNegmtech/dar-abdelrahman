import PublicOwnerProfile from "./public-owner-profile";

export default async function Page({ params }: { params: Promise<{ ownerId: string }> }) {
  const { ownerId } = await params;
  return <PublicOwnerProfile ownerId={ownerId} />;
}
