import type { LucideIcon } from "lucide-react";
import { Card } from "@/features/design-system";
import { ButtonLink } from "@/components/ui";

type OwnerPlaceholderPageProps = {
  description: string;
  icon: LucideIcon;
  title: string;
};

export function OwnerPlaceholderPage({ description, icon: PageIcon, title }: OwnerPlaceholderPageProps) {
  return (
    <div className="owner-dashboard-content">
        <div className="px-7 pt-6 max-[600px]:px-4">
          <h1 className="owner-page-title">{title}</h1>
          <p className="owner-page-description mt-2">{description}</p>
          <Card className="mt-5 flex min-h-64 flex-col items-center justify-center p-8 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
              <PageIcon aria-hidden="true" className="size-7" strokeWidth={1.8} />
            </span>
            <h2 className="owner-section-title mt-5">{title} is ready for the next sprint</h2>
            <p className="owner-body mt-2 max-w-md text-[#59637d]">The route and Owner navigation are now available. Business functionality will be added separately.</p>
            <ButtonLink href="/owner" size="sm" className="mt-6">Back to Dashboard</ButtonLink>
          </Card>
        </div>
    </div>
  );
}
