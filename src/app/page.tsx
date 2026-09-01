"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { DashboardData } from "@/lib/types";
import { inr, num } from "@/lib/format";
import { PageHeader, KpiCard, Card, Loading, ErrorState } from "@/components/ui";
import { TrendChart, BarChart } from "@/components/Charts";

const TIERS = ["Standard", "Premium Creator", "Brand Partner"];
const STATUSES = ["Active", "Pending", "Suspended", "Rejected", "Banned"];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tier, setTier] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (tier) params.set("tier", tier);
    if (status) params.set("status", status);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    setData(null);
    api
      .get<DashboardData>(`/analytics/dashboard?${params.toString()}`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [tier, status, from, to]);

  if (error) return <ErrorState message={error} />;
  if (!data) return <Loading />;

  const { kpis, leaderboard, trends } = data;
  const dayLabels = trends.days.map((d) => d.slice(5)); // MM-DD

  return (
    <div>
      <PageHeader
        title="Affiliate Dashboard"
        subtitle="How is the affiliate program performing overall — across onboarding, promotion, conversions and commission payouts."
      />

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <input type="date" className="input w-40" value={from} onChange={(e) => setFrom(e.target.value)} />
        <span className="text-xs text-[var(--muted)]">to</span>
        <input type="date" className="input w-40" value={to} onChange={(e) => setTo(e.target.value)} />
        <select className="input w-40" value={tier} onChange={(e) => setTier(e.target.value)}>
          <option value="">All tiers</option>
          {TIERS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select className="input w-40" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {(tier || status || from || to) && (
          <button
            className="text-xs text-[var(--violet)] hover:underline"
            onClick={() => {
              setTier("");
              setStatus("");
              setFrom("");
              setTo("");
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Affiliates" value={num(kpis.totalAffiliates)} accent="violet" />
        <KpiCard label="Active Affiliates" value={num(kpis.activeAffiliates)} accent="teal" />
        <KpiCard label="Pending Approval" value={num(kpis.pendingApproval)} accent="amber" />
        <KpiCard label="Total Clicks" value={num(kpis.totalClicks)} accent="violet" />
        <KpiCard label="Total Conversions" value={num(kpis.totalConversions)} accent="teal" />
        <KpiCard label="Conversion Rate" value={`${kpis.overallConversionRate}%`} accent="violet" />
        <KpiCard label="Commission Payable" value={inr(kpis.totalCommissionPayable)} accent="amber" />
        <KpiCard label="Commission Paid" value={inr(kpis.totalCommissionPaid)} accent="teal" />
      </div>

      <div className="grid grid-cols-3 gap-5 mb-5">
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Affiliate Growth</h2>
          <TrendChart labels={dayLabels} series={[{ label: "New affiliates", color: "var(--violet)", data: trends.newAffiliates }]} height={160} />
        </Card>
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Clicks vs Conversions</h2>
          <TrendChart
            labels={dayLabels}
            height={160}
            series={[
              { label: "Clicks", color: "var(--violet)", data: trends.clicks },
              { label: "Conversions", color: "var(--teal)", data: trends.conversions },
            ]}
          />
        </Card>
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Commission Payable vs Paid</h2>
          <TrendChart
            labels={dayLabels}
            height={160}
            formatValue={inr}
            series={[
              { label: "Payable", color: "var(--amber)", data: trends.commissionPayable },
              { label: "Paid", color: "var(--teal)", data: trends.commissionPaid },
            ]}
          />
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <Card className="col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-[15px]">Top Affiliates</h2>
            <span className="text-xs text-[var(--muted)]">Ranked by commission earned</span>
          </div>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-[var(--muted)] py-6 text-center">No affiliates match this filter.</p>
          ) : (
            <BarChart data={leaderboard.map((l) => ({ label: l.name, value: l.commission }))} formatValue={inr} />
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-4">Master Flow</h2>
          <ol className="relative border-l border-[var(--line)] pl-4 space-y-4 text-[13px]">
            {[
              "Affiliate Signup / Onboarding",
              "Admin Approval",
              "Link & Code Generation",
              "Promotion (Clicks → Leads)",
              "Conversion (Signup → Subscription)",
              "Commission Calculation",
              "Commission Approval",
              "Payout",
              "Fraud Check",
            ].map((step) => (
              <li key={step} className="relative">
                <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-[var(--violet)]" />
                {step}
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}
