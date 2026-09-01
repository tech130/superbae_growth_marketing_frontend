"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { inr, num } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, Loading, ErrorState } from "@/components/ui";

interface PerfRow {
  rank: number;
  id: string;
  name: string;
  sourceType: string;
  clicks: number;
  subscriptions: number;
  revenue: number;
  spend: number;
  roi: number;
}

const SOURCE_TYPES = ["Referral", "Affiliate", "Influencer", "Promo", "Coupon"];

export default function CampaignPerformancePage() {
  const [rows, setRows] = useState<PerfRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (sourceType) params.set("sourceType", sourceType);
    setRows(null);
    api.get<PerfRow[]>(`/campaign-management/performance?${params.toString()}`).then(setRows).catch((e) => setError(e.message));
  }, [sourceType]);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Campaign Performance"
        subtitle="Compare all campaigns against each other, across every source type — identify what's worth repeating or scaling."
      />

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <select className="input w-44" value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
          <option value="">All sources</option>
          {SOURCE_TYPES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <Card>
        {!rows ? (
          <Loading />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Rank</Th>
                <Th>Campaign</Th>
                <Th>Source</Th>
                <Th>Clicks</Th>
                <Th>Subscriptions</Th>
                <Th>Revenue</Th>
                <Th>Spend</Th>
                <Th>ROI</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <Td className="font-mono">{r.rank}</Td>
                  <Td className="font-medium">
                    <Link href={`/campaign-management/${r.id}`} className="hover:text-[var(--violet)]">
                      {r.name}
                    </Link>
                  </Td>
                  <Td>{r.sourceType}</Td>
                  <Td className="font-mono">{num(r.clicks)}</Td>
                  <Td className="font-mono">{num(r.subscriptions)}</Td>
                  <Td className="font-mono">{inr(r.revenue)}</Td>
                  <Td className="font-mono">{inr(r.spend)}</Td>
                  <Td className="font-mono">{r.roi}x</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
