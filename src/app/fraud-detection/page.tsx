"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr, num } from "@/lib/format";
import { PageHeader, Card, KpiCard, Button, Loading, ErrorState } from "@/components/ui";
import { BarChart } from "@/components/Charts";

interface DashboardData {
  kpis: {
    openCases: number;
    highRiskFlags: number;
    rewardsOnHold: number;
    commissionOnHold: number;
    confirmedFraudThisMonth: number;
    falsePositives: number;
  };
  byType: { fraudType: string; count: number }[];
  bySource: { sourceType: string; count: number }[];
  riskDistribution: { riskLevel: string; count: number }[];
}

export default function FraudDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  function load() {
    api.get<DashboardData>("/fraud-detection/dashboard").then(setData).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  async function runSweep() {
    setRunning(true);
    try {
      await api.post("/fraud-detection/run");
      load();
    } finally {
      setRunning(false);
    }
  }

  if (error) return <ErrorState message={error} />;
  if (!data) return <Loading />;
  const { kpis } = data;

  return (
    <div>
      <PageHeader
        title="Fraud Dashboard"
        subtitle="How much fraud are we catching, and how much reward/commission is on hold — across Referral, Affiliate, Creator and Brand."
        action={
          <Button onClick={runSweep} disabled={running}>
            {running ? "Running…" : "Run detection sweep"}
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-3">
        <KpiCard label="Open Cases" value={num(kpis.openCases)} accent="amber" />
        <KpiCard label="High-Risk Flags" value={num(kpis.highRiskFlags)} accent="coral" />
        <KpiCard label="Confirmed Fraud (This Month)" value={num(kpis.confirmedFraudThisMonth)} accent="coral" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <KpiCard label="Rewards On Hold" value={inr(kpis.rewardsOnHold)} accent="violet" />
        <KpiCard label="Commission On Hold" value={inr(kpis.commissionOnHold)} accent="violet" />
        <KpiCard label="False Positives" value={num(kpis.falsePositives)} accent="teal" />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Flags by Type</h2>
          <BarChart data={data.byType.map((t) => ({ label: t.fraudType, value: t.count }))} formatValue={num} />
        </Card>
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Flags by Source</h2>
          <BarChart data={data.bySource.map((s) => ({ label: s.sourceType, value: s.count }))} formatValue={num} color="var(--teal)" />
        </Card>
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Risk Score Distribution</h2>
          <BarChart data={data.riskDistribution.map((r) => ({ label: r.riskLevel, value: r.count }))} formatValue={num} color="var(--coral)" />
        </Card>
      </div>
    </div>
  );
}
