"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr } from "@/lib/format";
import { PageHeader, Card, KpiCard, Loading, ErrorState } from "@/components/ui";
import { BarChart } from "@/components/Charts";

interface DashboardData {
  kpis: {
    totalPayable: number;
    pending: number;
    approved: number;
    processing: number;
    paidThisMonth: number;
    paidLastMonth: number;
    failed: number;
  };
  byPartnerType: { partnerType: string; amount: number }[];
  byMethod: { method: string; amount: number }[];
  byStatus: { status: string; amount: number }[];
  count: number;
}

export default function PayoutManagementDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<DashboardData>("/payout-management/dashboard").then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!data) return <Loading />;
  const { kpis } = data;

  return (
    <div>
      <PageHeader
        title="Payout Dashboard"
        subtitle="How much do we owe partners across Affiliate, Creator and Brand, and how much has been paid — the shared money-out engine for Super Bae."
      />

      <div className="grid grid-cols-4 gap-4 mb-3">
        <KpiCard label="Total Payable" value={inr(kpis.totalPayable)} accent="violet" />
        <KpiCard label="Pending" value={inr(kpis.pending)} accent="amber" />
        <KpiCard label="Approved" value={inr(kpis.approved)} accent="violet" />
        <KpiCard label="Processing" value={inr(kpis.processing)} accent="violet" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <KpiCard label="Paid (This Month)" value={inr(kpis.paidThisMonth)} accent="teal" />
        <KpiCard label="Paid (Last Month)" value={inr(kpis.paidLastMonth)} accent="teal" />
        <KpiCard label="Failed" value={inr(kpis.failed)} accent="coral" />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Payouts by Partner Type</h2>
          <BarChart data={data.byPartnerType.map((p) => ({ label: p.partnerType, value: p.amount }))} formatValue={inr} />
        </Card>
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Payouts by Method</h2>
          <BarChart data={data.byMethod.map((m) => ({ label: m.method, value: m.amount }))} formatValue={inr} color="var(--teal)" />
        </Card>
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Payable vs Paid by Status</h2>
          <BarChart data={data.byStatus.map((s) => ({ label: s.status, value: s.amount }))} formatValue={inr} color="var(--amber)" />
        </Card>
      </div>
    </div>
  );
}
