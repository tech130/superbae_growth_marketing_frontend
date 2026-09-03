"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr, num } from "@/lib/format";
import { PageHeader, Card, KpiCard, Loading, ErrorState } from "@/components/ui";
import { BarChart } from "@/components/Charts";

interface DashboardData {
  kpis: {
    totalMembers: number;
    activeThisMonth: number;
    pointsIssued: number;
    pointsRedeemed: number;
    vipMembers: number;
    avgPointsPerUser: number;
  };
  byTier: { tier: string; members: number }[];
}

export default function LoyaltyDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<DashboardData>("/loyalty/dashboard").then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!data) return <Loading />;
  const { kpis } = data;

  return (
    <div>
      <PageHeader
        title="Loyalty Dashboard"
        subtitle="Is the loyalty program keeping users engaged and subscribed? The retention engine for Super Bae — earning points, climbing tiers, unlocking benefits."
      />

      <div className="grid grid-cols-3 gap-4 mb-3">
        <KpiCard label="Total Loyalty Members" value={num(kpis.totalMembers)} accent="violet" />
        <KpiCard label="Active This Month" value={num(kpis.activeThisMonth)} accent="teal" />
        <KpiCard label="VIP Members" value={num(kpis.vipMembers)} accent="amber" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <KpiCard label="Points Issued" value={num(kpis.pointsIssued)} accent="teal" />
        <KpiCard label="Points Redeemed" value={num(kpis.pointsRedeemed)} accent="amber" />
        <KpiCard label="Avg. Points per User" value={num(kpis.avgPointsPerUser)} accent="violet" />
      </div>

      <Card className="p-5">
        <h2 className="font-display font-semibold text-[15px] mb-3">Members by Tier</h2>
        <BarChart data={data.byTier.map((t) => ({ label: t.tier, value: t.members }))} formatValue={num} />
      </Card>
    </div>
  );
}
