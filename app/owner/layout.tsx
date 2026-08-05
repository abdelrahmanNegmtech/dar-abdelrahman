export default function OwnerDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="dar-owner-dashboard contents">{children}</div>;
}
