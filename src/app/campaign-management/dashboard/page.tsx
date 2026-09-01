"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr, num } from "@/lib/format";
import { PageHeader, KpiCard, Card, Loading, ErrorState } from "@/components/ui";
import { BarChart, TrendChart } from "@/components/Charts";

const SOURCE_TYPES = ["Referral", "Affiliate", "Influencer", "Promo", "Coupon"];
const CATEGORIES = ["Fashion", "Beauty", "Wellness", "Travel", "Fitness", "Lifestyle", "Restaurants", "Experiences"];
const STATUSES = ["Draft", "Active", "Paused", "Ended"];

interface DashboardData {
  kpis: {
    activeCampaigns: number;
    totalImpressions: number;
    totalClicks: number;
    totalInstalls: number;
    totalSignups: number;
    totalSubscriptions: number;
    totalRevenue: number;
    totalSpend: number;
  };
  funnel: { impressions: number; clicks: number; installs: number; signups: number; subscriptions: number; revenue: number };
  byCampaign: { name: string; spend: number; revenue: number }[];
  bySource: { sourceType: string; revenue: number }[];
}

export default function CampaignDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (sourceType) params.set("sourceType", sourceType);
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    setData(null);
    api
      .get<DashboardData>(`/campaign-management/dashboard?${params.toString()}`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [sourceType, category, status, from, to]);

  if (error) return <ErrorState message={error} />;
  if (!data) return <Loading />;

  const { kpis, funnel, byCampaign, bySource } = data;

  return (
    <div>
      <PageHeader
        title="Campaign Dashboard"
        subtitle="How are all our campaigns performing, across every acquisition source — Referral, Affiliate, Influencer, Promo and Coupon."
      />

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <input type="date" className="input w-40" value={from} onChange={(e) => setFrom(e.target.value)} />
        <span className="text-xs text-[var(--muted)]">to</span>
        <input type="date" className="input w-40" value={to} onChange={(e) => setTo(e.target.value)} />
        <select className="input w-40" value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
          <option value="">All sources</option>
          {SOURCE_TYPES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className="input w-40" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select className="input w-36" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {(sourceType || category || status || from || to) && (
          <button
            className="text-xs text-[var(--violet)] hover:underline"
            onClick={() => {
              setSourceType("");
              setCategory("");
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
        <KpiCard label="Active Campaigns" value={num(kpis.activeCampaigns)} accent="violet" />
        <KpiCard label="Total Impressions" value={num(kpis.totalImpressions)} accent="violet" />
        <KpiCard label="Total Clicks" value={num(kpis.totalClicks)} accent="teal" />
        <KpiCard label="Total Installs" value={num(kpis.totalInstalls)} accent="teal" />
        <KpiCard label="Total Signups" value={num(kpis.totalSignups)} accent="amber" />
        <KpiCard label="Total Subscriptions" value={num(kpis.totalSubscriptions)} accent="amber" />
        <KpiCard label="Total Revenue" value={inr(kpis.totalRevenue)} accent="teal" />
        <KpiCard label="Total Spend" value={inr(kpis.totalSpend)} accent="coral" />
      </div>

      <div className="grid grid-cols-3 gap-5 mb-5">
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Funnel</h2>
          <p className="text-[11px] text-[var(--muted)] -mt-2 mb-3">Impressions → Clicks → Installs → Signups → Subscriptions</p>
          <BarChart
            data={[
              { label: "Impressions", value: funnel.impressions },
              { label: "Clicks", value: funnel.clicks },
              { label: "Installs", value: funnel.installs },
              { label: "Signups", value: funnel.signups },
              { label: "Subscriptions", value: funnel.subscriptions },
            ]}
            formatValue={num}
          />
        </Card>
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Campaign Performance Trend</h2>
          <p className="text-[11px] text-[var(--muted)] -mt-2 mb-2">Revenue by campaign, top 8</p>
          {byCampaign.length === 0 ? (
            <p className="text-sm text-[var(--muted)] py-6 text-center">No campaigns yet.</p>
          ) : (
            <TrendChart
              labels={byCampaign.map((c) => c.name)}
              height={160}
              formatValue={inr}
              series={[{ label: "Revenue", color: "var(--violet)", data: byCampaign.map((c) => c.revenue) }]}
            />
          )}
        </Card>
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Spend vs Revenue by Campaign</h2>
          {byCampaign.length === 0 ? (
            <p className="text-sm text-[var(--muted)] py-6 text-center">No campaigns yet.</p>
          ) : (
            <TrendChart
              labels={byCampaign.map((c) => c.name)}
              height={160}
              formatValue={inr}
              series={[
                { label: "Spend", color: "var(--coral)", data: byCampaign.map((c) => c.spend) },
                { label: "Revenue", color: "var(--teal)", data: byCampaign.map((c) => c.revenue) },
              ]}
            />
          )}
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="font-display font-semibold text-[15px] mb-3">Revenue by Source Type</h2>
        <BarChart data={bySource.map((s) => ({ label: s.sourceType, value: s.revenue }))} formatValue={inr} color="var(--amber)" />
      </Card>
    </div>
  );
}
