import type { PropertiesPageData } from "./types";
import { PropertiesWorkspace } from "./components/properties-workspace";

export function PropertiesManagementPage({ pageData }: { pageData?: PropertiesPageData }) {
  return <PropertiesWorkspace pageData={pageData} />;
}
