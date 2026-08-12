import type { UsersPageData } from "./types";
import { UsersManagementWorkspace } from "./components/users-management-workspace";

export function UsersManagementPage({ pageData }: { pageData?: UsersPageData }) {
  return <UsersManagementWorkspace pageData={pageData} />;
}
