import { UsersManagementPage } from "@/features/users/users-management-page";
import { getAdminUsersPageData } from "@/features/admin/data/admin-users-queries";

export default async function AdminUsers() {
  const pageData = await getAdminUsersPageData();
  return <UsersManagementPage pageData={pageData} />;
}
