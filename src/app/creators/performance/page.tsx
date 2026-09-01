"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr, num } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, Loading, ErrorState } from "@/components/ui";

interface PerfRow {
  rank: number;
  affiliateId: string;
  name: string;
  category: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  commission: number;
  reach: number;
}

const CATEGORIES = ["Fashion", "Beauty", "Wellness", "Travel", "Fitness", "Lifestyle", "Restaurants", "Experiences"];

export default function CreatorPerformancePage() {
  const [rows, setRows] = useState<PerfRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<"top" | "under">("top");

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("tier", "Premium Creator");
    if (category) params.set("category", category);
    params.set("sort", sort);
    setRows(null);
    api.get<PerfRow[]>(`/analytics/performance?${params.toString()}`).then(setRows).catch((e) => setError(e.message));
  }, [category, sort]);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Creator Performance"
        subtitle="Ranking and comparing creators against each other — informs tier upgrades or renegotiation."
      />

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <select className="input w-44" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <div className="flex gap-1">
          <button
            onClick={() => setSort("top")}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-medium ${sort === "top" ? "bg-[var(--violet)] text-white" : "bg-white border border-[var(--line)] text-[var(--muted)]"}`}
          >
            Top performing
          </button>
          <button
            onClick={() => setSort("under")}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-medium ${sort === "under" ? "bg-[var(--violet)] text-white" : "bg-white border border-[var(--line)] text-[var(--muted)]"}`}
          >
            Underperforming
          </button>
        </div>
      </div>

      <Card>
        {!rows ? (
          <Loading />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Rank</Th>
                <Th>Creator</Th>
                <Th>Category</Th>
                <Th>Reach</Th>
                <Th>Clicks</Th>
                <Th>Conversions</Th>
                <Th>Conv. Rate</Th>
                <Th>Revenue</Th>
                <Th>Commission</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.affiliateId}>
                  <Td className="font-mono">{r.rank}</Td>
                  <Td className="font-medium">{r.name}</Td>
                  <Td>{r.category}</Td>
                  <Td className="font-mono">{num(r.reach)}</Td>
                  <Td className="font-mono">{num(r.clicks)}</Td>
                  <Td className="font-mono">{num(r.conversions)}</Td>
                  <Td className="font-mono">{r.conversionRate}%</Td>
                  <Td className="font-mono">{inr(r.revenue)}</Td>
                  <Td className="font-mono">{inr(r.commission)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
