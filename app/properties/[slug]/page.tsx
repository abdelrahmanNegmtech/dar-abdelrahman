import { redirect } from "next/navigation";

type PropertyPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  redirect(`/stays/${slug}`);
}
