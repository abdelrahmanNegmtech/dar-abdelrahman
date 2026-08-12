import { BookingsManagementPage } from "@/features/bookings/bookings-management-page";
import { getAdminBookingsPageData } from "@/features/admin/data/admin-bookings-queries";

export default async function AdminBookings() {
  const pageData = await getAdminBookingsPageData();
  return <BookingsManagementPage pageData={pageData} />;
}
