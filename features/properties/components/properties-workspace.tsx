"use client";

import { useMemo, useState } from "react";

import { AdminBrand, AppShell, PageContainer, Sidebar, SidebarSupportCard } from "@/features/design-system";

import { propertiesManagementData } from "../data/properties-management.data";
import type { PropertyCategory, PropertyFilters, PropertyRecord } from "../types";
import { PropertiesBulkActions } from "./properties-bulk-actions";
import { PropertyDetailPanel } from "./property-detail-panel";
import { PropertiesFilters } from "./properties-filters";
import { PropertiesHeader } from "./properties-header";
import { PropertiesMetrics } from "./properties-metrics";
import { PropertySummaryCards, PropertyTipsCard } from "./property-summary-cards";
import { PropertiesTable } from "./properties-table";
import { PropertiesTabs } from "./properties-tabs";

function filterByCategory(property: PropertyRecord, category: PropertyCategory) {
  switch (category) {
    case "live":
      return property.status === "live";
    case "under-review":
      return property.status === "under-review";
    case "drafts":
      return property.status === "draft";
    case "rejected":
      return property.status === "reported" && property.qualityScore < 70;
    case "reported":
      return property.status === "reported";
    case "hotels":
      return property.ownerType === "hotel";
    case "needs-update":
      return property.status === "needs-update";
    default:
      return true;
  }
}

export function PropertiesWorkspace({
  pageData = propertiesManagementData,
}: {
  pageData?: typeof propertiesManagementData;
}) {
  const [filters, setFilters] = useState(pageData.initialFilters);
  const [category, setCategory] = useState<PropertyCategory>(pageData.initialCategory);
  const [selectedPropertyId, setSelectedPropertyId] = useState(pageData.initialPropertyId);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([pageData.initialPropertyId]);
  const [rowsPerPage, setRowsPerPage] = useState("5");
  const [page, setPage] = useState(1);
  const [adminNote, setAdminNote] = useState("");
  const [saveView, setSaveView] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const filteredProperties = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    return pageData.properties.filter((property) => {
      const matchesSearch =
        !normalizedSearch ||
        [property.id, property.title, property.ownerName, property.cityArea].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        );

      return matchesSearch && filterByCategory(property, category);
    });
  }, [category, filters.search, pageData.properties]);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / Math.max(1, Number(rowsPerPage))));
  const currentPage = Math.min(page, totalPages);
  const paginatedProperties = filteredProperties.slice(0, Number(rowsPerPage));
  const selectedProperty =
    pageData.properties.find((property) => property.id === selectedPropertyId) ??
    pageData.properties[0];
  const allVisibleRowsSelected =
    paginatedProperties.length > 0 &&
    paginatedProperties.every((property) => selectedRowIds.includes(property.id));

  function updateFilter<K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clearFilters() {
    setFilters(pageData.initialFilters);
    setCategory(pageData.initialCategory);
  }

  function toggleRow(rowId: string) {
    setSelectedRowIds((current) =>
      current.includes(rowId) ? current.filter((id) => id !== rowId) : [...current, rowId],
    );
    setSelectedPropertyId(rowId);
  }

  function toggleAll() {
    const visibleIds = paginatedProperties.map((property) => property.id);
    setSelectedRowIds((current) =>
      allVisibleRowsSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds])),
    );
  }

  return (
    <AppShell
      mainClassName="bg-white py-3 md:py-4"
      sidebar={
        <Sidebar
          brand={<AdminBrand />}
          groups={pageData.sidebarGroups}
          footer={<SidebarSupportCard />}
          theme="dark"
        />
      }
      topbar={<PropertiesHeader />}
    >
      <PageContainer className="space-y-4 pt-1 md:pt-2">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-4">
            <PropertiesMetrics metrics={pageData.metrics} />

            <PropertiesFilters
              filters={filters}
              onFilterChange={updateFilter}
              onClear={clearFilters}
              saveView={saveView}
              onToggleSaveView={() => setSaveView((current) => !current)}
              options={pageData.filterOptions}
            />

            <PropertySummaryCards
              summaries={pageData.summaryCards}
              qualityDistribution={pageData.qualityDistribution}
            />

            <section className="rounded-[0.75rem] border border-border/90 bg-white px-3 py-3 shadow-[0_2px_10px_rgba(16,25,58,0.03)]">
              <div className="space-y-3">
                <div className="space-y-2">
                  <h2 className="text-[16px] font-semibold tracking-tight text-foreground">
                    All properties
                  </h2>
                  <PropertiesTabs
                    tabs={pageData.categoryTabs}
                    activeTab={category}
                    onChange={(value) => {
                      setCategory(value);
                      setPage(1);
                    }}
                  />
                </div>

                <PropertiesTable
                  rows={paginatedProperties}
                  selectedPropertyId={selectedPropertyId}
                  selectedRowIds={selectedRowIds}
                  allVisibleRowsSelected={allVisibleRowsSelected}
                  onSelectProperty={setSelectedPropertyId}
                  onToggleRow={toggleRow}
                  onToggleAll={toggleAll}
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(value) => {
                    setRowsPerPage(value);
                    setPage(1);
                  }}
                />
              </div>
            </section>

            <PropertiesBulkActions selectedCount={selectedRowIds.length} />
          </div>

          <div className="min-w-0 space-y-4">
            <PropertyDetailPanel
              property={selectedProperty}
              checklist={selectedProperty?.checklist ?? pageData.checklist}
              adminNote={adminNote}
              onAdminNoteChange={setAdminNote}
              bookmarked={bookmarked}
              onToggleBookmark={() => setBookmarked((current) => !current)}
            />

            <PropertyTipsCard />
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}
