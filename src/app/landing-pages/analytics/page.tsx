"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { num } from "@/lib/format";
import { PageHeader, Card, KpiCard, Table, Th, Td, StatusBadge, Loading, ErrorState } from "@/components/ui";
import { BarChart } from "@/components/Charts";

interface AnalyticsData {
  pages: { id: string; name: string; sourceType: string; visits: number; installs: number; signups: number; ctr: number; status: string }[];
  deepLinkSummary: { active: number; totalClicks: number; totalOpens: number };
  qrSummary: { totalScans: number; totalInstalls: number };
  byPlatform: { platform: string; visits: number }[];
}

export default function LinkAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<AnalyticsData>("/landing-pages/link-analytics").then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!data) return <Loading />;

  return (
    <div>
      <PageHeader title="Link Analytics" subtitle="The raw funnel from visit to install to attribution, for every page, deep link, and QR code." />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard label="Active Deep Links" value={num(data.deepLinkSummary.active)} accent="violet" />
        <KpiCard label="Deep Link Clicks" value={num(data.deepLinkSummary.totalClicks)} accent="teal" />
        <KpiCard label="QR Scans" value={num(data.qrSummary.totalScans)} accent="amber" />
        <KpiCard label="QR-Attributed Installs" value={num(data.qrSummary.totalInstalls)} accent="teal" />
      </div>

      <Card className="p-5 mb-5">
        <h2 className="font-display font-semibold text-[15px] mb-3">Visits by Platform</h2>
        <BarChart data={data.byPlatform.map((p) => ({ label: p.platform, value: p.visits }))} formatValue={num} />
      </Card>

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Page</Th>
              <Th>Source</Th>
              <Th>Visits</Th>
              <Th>Installs</Th>
              <Th>Signups</Th>
              <Th>CTR</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {data.pages.map((p) => (
              <tr key={p.id}>
                <Td className="font-medium">{p.name}</Td>
                <Td>{p.sourceType}</Td>
                <Td className="font-mono">{num(p.visits)}</Td>
                <Td className="font-mono">{num(p.installs)}</Td>
                <Td className="font-mono">{num(p.signups)}</Td>
                <Td className="font-mono">{p.ctr}%</Td>
                <Td><StatusBadge status={p.status} /></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
