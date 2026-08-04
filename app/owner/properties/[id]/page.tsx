import PropertyStatus from "./property-status";

export default async function OwnerPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PropertyStatus id={id} />;
}
