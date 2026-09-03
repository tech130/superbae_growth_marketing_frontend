"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr, num } from "@/lib/format";
import { PageHeader, Card, KpiCard, Loading, ErrorState } from "@/components/ui";
import { BarChart } from "@/components/Charts";

interface DashboardData {
  model: string;
  kpis: {
    attributedConversions: number;
    attributedRevenue: number;
    topSource: string;
    multiTouchConversions: number;
    unattributed: number;
    disputedOverlap: number;
  };
  bySource: { sourceType: string; conversions: number; revenue: number }[];
}

const MODELS = [
  { value: "linear", label: "Multi-touch (linear)" },
  { value: "first-touch", label: "First-touch" },
  { value: "last-touch", label: "Last-touch" },
];

export default function AttributionDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState("linear");

  useEffect(() => {
    setData(null);
    api.get<DashboardData>(`/attribution/dashboard?model=${model}`).then(setData).catch((e) => setError(e.message));
  }, [model]);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Attribution Dashboard"
        subtitle="Which sources are actually driving our paying users, and how is credit split between them — the 'who gets the credit' engine for Super Bae."
        action={
          <select className="input w-56" value={model} onChange={(e) => setModel(e.target.value)}>
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        }
      />

      {!data ? (
        <Loading />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-3">
            <KpiCard label="Attributed Conversions" value={num(data.kpis.attributedConversions)} accent="violet" />
            <KpiCard label="Attributed Revenue" value={inr(data.kpis.attributedRevenue)} accent="teal" />
            <KpiCard label="Top Source" value={data.kpis.topSource} accent="amber" />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <KpiCard label="Multi-Touch Conversions" value={num(data.kpis.multiTouchConversions)} accent="violet" />
            <KpiCard label="Unattributed / Organic" value={num(data.kpis.unattributed)} accent="coral" />
            <KpiCard label="Disputed / Overlapping" value={num(data.kpis.disputedOverlap)} accent="coral" />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Card className="p-5">
              <h2 className="font-display font-semibold text-[15px] mb-3">Conversions by Source</h2>
              <BarChart data={data.bySource.map((s) => ({ label: s.sourceType, value: s.conversions }))} formatValue={num} />
            </Card>
            <Card className="p-5">
              <h2 className="font-display font-semibold text-[15px] mb-3">Revenue by Source</h2>
              <BarChart data={data.bySource.map((s) => ({ label: s.sourceType, value: s.revenue }))} formatValue={inr} color="var(--teal)" />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
