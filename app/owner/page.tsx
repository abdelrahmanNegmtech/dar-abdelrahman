import { redirect } from "next/navigation";
import { ownerRoutes } from "@/lib/owner-routes";

export default function OwnerHomePage() {
  redirect(ownerRoutes.dashboard);
}
