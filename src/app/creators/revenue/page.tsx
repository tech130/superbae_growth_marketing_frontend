"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr } from "@/lib/format";
import { PageHeader, Card, KpiCard, Table, Th, Td, Loading, ErrorState } from "@/components/ui";
import { BarChart, TrendChart } from "@/components/Charts";

interface RevenueRow {
  affiliateId: string;
  name: string;
  category: string;
  revenue: number;
  commissionPaid: number;
  net: number;
  roi: number;
}
interface RevenueData {
  totals: { revenue: number; commissionPaid: number; net: number; avgRevenuePerAffiliate: number; avgRevenuePerConversion: number; roi: number };
  byAffiliate: RevenueRow[];
  trends: {
    byMonth: { month: string; revenue: number }[];
    byCategory: { category: string; revenue: number }[];
  };
}

export default function CreatorRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<RevenueData>("/analytics/revenue?tier=Premium%20Creator").then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!data) return <Loading />;

  const { trends } = data;

  return (
    <div>
      <PageHeader title="Creator Revenue" subtitle="Revenue and ROI reporting for the creator channel as a whole — is it profitable?" />

      <div className="grid grid-cols-3 gap-4 mb-3">
        <KpiCard label="Revenue Generated" value={inr(data.totals.revenue)} accent="violet" />
        <KpiCard label="Commission Paid" value={inr(data.totals.commissionPaid)} accent="amber" />
        <KpiCard label="Net Revenue" value={inr(data.totals.net)} accent="teal" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <KpiCard label="Avg Revenue / Creator" value={inr(data.totals.avgRevenuePerAffiliate)} accent="violet" />
        <KpiCard label="Avg Revenue / Conversion" value={inr(data.totals.avgRevenuePerConversion)} accent="violet" />
        <KpiCard label="Overall ROI" value={`${data.totals.roi}x`} accent="teal" />
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Revenue Trend (last 6 months)</h2>
          <TrendChart
            labels={trends.byMonth.map((m) => m.month.slice(2))}
            series={[{ label: "Revenue", color: "var(--violet)", data: trends.byMonth.map((m) => m.revenue) }]}
            formatValue={inr}
          />
        </Card>
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Revenue by Category</h2>
          <BarChart data={trends.byCategory.map((c) => ({ label: c.category, value: c.revenue }))} formatValue={inr} color="var(--teal)" />
        </Card>
      </div>

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Creator</Th>
              <Th>Revenue Generated</Th>
              <Th>Commission Paid</Th>
              <Th>Net Revenue</Th>
              <Th>ROI</Th>
            </tr>
          </thead>
          <tbody>
            {data.byAffiliate.map((r) => (
              <tr key={r.affiliateId}>
                <Td className="font-medium">{r.name}</Td>
                <Td className="font-mono">{inr(r.revenue)}</Td>
                <Td className="font-mono">{inr(r.commissionPaid)}</Td>
                <Td className="font-mono">{inr(r.net)}</Td>
                <Td className="font-mono">{r.roi}x</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
