"use client";

import { useState } from "react";

import { AdminBrand, AppShell, PageContainer, Sidebar, SidebarSupportCard } from "@/features/design-system";

import { overviewPageData } from "./data/overview.data";
import { OverviewCharts } from "./components/overview-charts";
import { OverviewHeader } from "./components/overview-header";
import { OverviewMetricGrid } from "./components/overview-metric-grid";
import { RecentBookingsCard } from "./components/recent-bookings-card";
import { SystemHealthCard } from "./components/system-health-card";
import { TopPropertiesCard } from "./components/top-properties-card";
import { UserSignupsCard } from "./components/user-signups-card";

export function OverviewPage() {
  const [searchValue, setSearchValue] = useState("");
  const [dateRange, setDateRange] = useState(overviewPageData.dateRanges[0]?.value ?? "");
  const [currency, setCurrency] = useState(overviewPageData.currencyOptions[0]?.value ?? "egp");

  return (
    <AppShell
      mainClassName="bg-white py-4 md:py-5"
      sidebar={
        <Sidebar
          brand={<AdminBrand />}
          groups={overviewPageData.sidebarGroups}
          footer={<SidebarSupportCard />}
          theme="dark"
        />
      }
      topbar={
        <OverviewHeader
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          dateRanges={overviewPageData.dateRanges}
          quickActions={overviewPageData.quickActions}
        />
      }
    >
      <PageContainer className="space-y-4">
        <OverviewMetricGrid metrics={overviewPageData.metrics} />

        <OverviewCharts
          bookingPoints={overviewPageData.bookingOverview.points}
          bookingTotal={overviewPageData.bookingOverview.totalLabel}
          bookingComparison={overviewPageData.bookingOverview.comparisonValue}
          revenuePoints={overviewPageData.revenueOverview.points}
          revenueTotal={overviewPageData.revenueOverview.totalLabel}
          revenueComparison={overviewPageData.revenueOverview.comparisonValue}
          currency={currency}
          onCurrencyChange={setCurrency}
        />

        <section className="grid gap-4 xl:grid-cols-[1.05fr_0.88fr_0.9fr]">
          <RecentBookingsCard items={overviewPageData.recentBookings} />
          <TopPropertiesCard items={overviewPageData.topProperties} />
          <UserSignupsCard segments={overviewPageData.signupSegments} />
        </section>

        <SystemHealthCard items={overviewPageData.systemStatus} />
      </PageContainer>
    </AppShell>
  );
}
