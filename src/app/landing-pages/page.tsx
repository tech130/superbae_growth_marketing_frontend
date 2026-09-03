"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { num } from "@/lib/format";
import { PageHeader, Card, KpiCard, Loading, ErrorState } from "@/components/ui";
import { BarChart } from "@/components/Charts";

interface DashboardData {
  kpis: {
    activeLandingPages: number;
    totalVisits: number;
    totalInstalls: number;
    visitToInstallRate: number;
    activeDeepLinks: number;
    qrScans: number;
  };
  bySource: { sourceType: string; visits: number; installs: number }[];
  topPages: { name: string; visits: number; installs: number }[];
}

export default function LandingPageDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<DashboardData>("/landing-pages/dashboard").then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!data) return <Loading />;
  const { kpis } = data;

  return (
    <div>
      <PageHeader
        title="Landing Page Dashboard"
        subtitle="How every landing page and link is converting traffic into installs — the destination and routing layer for every acquisition link in Super Bae."
      />

      <div className="grid grid-cols-3 gap-4 mb-3">
        <KpiCard label="Active Landing Pages" value={num(kpis.activeLandingPages)} accent="violet" />
        <KpiCard label="Total Visits" value={num(kpis.totalVisits)} accent="teal" />
        <KpiCard label="Total Installs from Links" value={num(kpis.totalInstalls)} accent="teal" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <KpiCard label="Visit → Install Rate" value={`${kpis.visitToInstallRate}%`} accent="amber" />
        <KpiCard label="Active Deep Links" value={num(kpis.activeDeepLinks)} accent="violet" />
        <KpiCard label="QR Scans" value={num(kpis.qrScans)} accent="amber" />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Traffic by Source</h2>
          <BarChart data={data.bySource.map((s) => ({ label: s.sourceType, value: s.visits }))} formatValue={num} />
        </Card>
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Top Pages by Visits</h2>
          <BarChart data={data.topPages.map((p) => ({ label: p.name, value: p.visits }))} formatValue={num} color="var(--teal)" />
        </Card>
      </div>
    </div>
  );
}
