"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr, num } from "@/lib/format";
import { PageHeader, KpiCard, Card, Loading, ErrorState } from "@/components/ui";
import { TrendChart, BarChart } from "@/components/Charts";

const CATEGORIES = ["Fashion", "Beauty", "Wellness", "Travel", "Fitness", "Lifestyle", "Restaurants", "Experiences"];
const PLATFORMS = ["Instagram", "YouTube", "TikTok", "Facebook", "X", "Other"];
const STATUSES = ["Active", "Pending", "Suspended", "Rejected", "Banned"];

interface DashboardData {
  kpis: {
    totalCreators: number;
    activeCreators: number;
    pendingVerification: number;
    totalReach: number;
    totalConversions: number;
    totalCommissionPayable: number;
    totalCommissionPaid: number;
  };
  leaderboard: { affiliateId: string; name: string; reach: number; conversions: number; commission: number }[];
  trends: {
    days: string[];
    newCreators: number[];
    reachProxyClicks: number[];
    conversions: number[];
    commissionPayable: number[];
    commissionPaid: number[];
  };
}

export default function CreatorDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (platform) params.set("platform", platform);
    if (status) params.set("status", status);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    setData(null);
    api
      .get<DashboardData>(`/creators/dashboard?${params.toString()}`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [category, platform, status, from, to]);

  if (error) return <ErrorState message={error} />;
  if (!data) return <Loading />;

  const { kpis, leaderboard, trends } = data;
  const dayLabels = trends.days.map((d) => d.slice(5));

  return (
    <div>
      <PageHeader
        title="Creator Dashboard"
        subtitle="How is our creator/influencer program performing — reach, conversions and commission across every creator."
      />

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <input type="date" className="input w-40" value={from} onChange={(e) => setFrom(e.target.value)} />
        <span className="text-xs text-[var(--muted)]">to</span>
        <input type="date" className="input w-40" value={to} onChange={(e) => setTo(e.target.value)} />
        <select className="input w-40" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select className="input w-40" value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option value="">All platforms</option>
          {PLATFORMS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <select className="input w-40" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {(category || platform || status || from || to) && (
          <button
            className="text-xs text-[var(--violet)] hover:underline"
            onClick={() => {
              setCategory("");
              setPlatform("");
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
        <KpiCard label="Total Creators" value={num(kpis.totalCreators)} accent="violet" />
        <KpiCard label="Active Creators" value={num(kpis.activeCreators)} accent="teal" />
        <KpiCard label="Pending Verification" value={num(kpis.pendingVerification)} accent="amber" />
        <KpiCard label="Total Reach" value={num(kpis.totalReach)} accent="violet" />
        <KpiCard label="Total Conversions" value={num(kpis.totalConversions)} accent="teal" />
        <KpiCard label="Commission Payable" value={inr(kpis.totalCommissionPayable)} accent="amber" />
        <KpiCard label="Commission Paid" value={inr(kpis.totalCommissionPaid)} accent="teal" />
      </div>

      <div className="grid grid-cols-3 gap-5 mb-5">
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Creator Growth Trend</h2>
          <TrendChart labels={dayLabels} series={[{ label: "New creators", color: "var(--violet)", data: trends.newCreators }]} height={160} />
        </Card>
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Reach vs Conversions Trend</h2>
          <p className="text-[11px] text-[var(--muted)] -mt-2 mb-2">Daily clicks used as a reach-engagement proxy.</p>
          <TrendChart
            labels={dayLabels}
            height={150}
            series={[
              { label: "Clicks (reach proxy)", color: "var(--violet)", data: trends.reachProxyClicks },
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

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-[15px]">Top-Performing Creators</h2>
          <span className="text-xs text-[var(--muted)]">Ranked by commission earned</span>
        </div>
        {leaderboard.length === 0 ? (
          <p className="text-sm text-[var(--muted)] py-6 text-center">No creators match this filter.</p>
        ) : (
          <BarChart data={leaderboard.map((l) => ({ label: l.name, value: l.commission }))} formatValue={inr} />
        )}
      </Card>
    </div>
  );
}
