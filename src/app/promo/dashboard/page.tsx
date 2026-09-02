"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { inr, num, dateShort } from "@/lib/format";
import { PageHeader, KpiCard, Card, Table, Th, Td, StatusBadge, Button, Loading, ErrorState } from "@/components/ui";

type PromoDashboardData = {
  totalCodes: number;
  totalActiveCodes: number;
  totalExpiredCodes: number;
  totalRedemptions: number;
  totalDiscountGiven: number;
  sourceStats: Record<string, { codes: number; redemptions: number; discount: number }>;
  recentRedemptions: Array<{
    _id: string;
    code: string;
    user?: string;
    source?: string;
    discountApplied: number;
    createdAt: string;
  }>;
  topCodes: Array<{
    _id: string;
    code: string;
    source: string;
    discountType: string;
    discountValue: number;
    redemptionsCount: number;
    totalDiscountGiven: number;
    status: string;
  }>;
};

const sources = ["campaign", "brand", "creator", "affiliate", "referral", "manual"];

export default function PromoDashboardPage() {
  const [data, setData] = useState<PromoDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get<PromoDashboardData>("/promo-management/dashboard");
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load promo dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promo Code Dashboard"
        subtitle="Universal coupon and discount engine tracking redemptions across all acquisition channels."
        action={
          <div className="flex gap-2">
            <Link
              href="/promo/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--violet)] text-white px-4 py-2 text-sm font-medium hover:bg-[#b03d82] transition-colors"
            >
              + Create Promo Code
            </Link>
            <Button variant="secondary" onClick={loadData}>
              Refresh
            </Button>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Promo Codes"
          value={num(data?.totalCodes || 0)}
          hint={`${data?.totalActiveCodes || 0} active · ${data?.totalExpiredCodes || 0} expired`}
          accent="violet"
        />
        <KpiCard
          label="Total Redemptions"
          value={num(data?.totalRedemptions || 0)}
          hint="Customer checkouts"
          accent="teal"
        />
        <KpiCard
          label="Total Discounts Given"
          value={inr(data?.totalDiscountGiven || 0)}
          hint="Acquisition incentive cost"
          accent="amber"
        />
        <KpiCard
          label="Active Campaign Codes"
          value={num(data?.totalActiveCodes || 0)}
          hint="Ready for redemption"
          accent="coral"
        />
      </div>

      {/* Source Breakdown Grid */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display font-bold text-lg text-[var(--ink)]">Performance by Acquisition Source</div>
            <p className="text-xs text-[var(--muted)]">Volume and discount impact grouped by promotion originator</p>
          </div>
          <Link href="/promo" className="text-xs font-semibold text-[var(--violet)] hover:underline">
            View All Codes →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sources.map((src) => {
            const stat = data?.sourceStats?.[src] || { codes: 0, redemptions: 0, discount: 0 };
            return (
              <div
                key={src}
                className="p-4 rounded-xl border border-[var(--line)] bg-[var(--paper)] hover:border-[var(--violet)] transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm capitalize text-[var(--ink)]">{src} Codes</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-black/5 text-[var(--muted)]">
                    {stat.codes} codes
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--muted)] pt-1">
                  <span>Redemptions: <strong className="text-[var(--ink)]">{num(stat.redemptions)}</strong></span>
                  <span className="font-mono">{inr(stat.discount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Top Codes & Recent Redemptions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Codes */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-[var(--line)] font-display font-bold text-base text-[var(--ink)]">
            Top Performing Codes
          </div>
          {data?.topCodes?.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--muted)]">No codes recorded yet.</div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Code</Th>
                  <Th>Source</Th>
                  <Th>Redemptions</Th>
                  <Th className="text-right">Discount Total</Th>
                </tr>
              </thead>
              <tbody>
                {data?.topCodes?.map((c) => (
                  <tr key={c._id} className="hover:bg-black/5 transition-colors">
                    <Td className="font-mono font-bold text-[var(--violet)]">{c.code}</Td>
                    <Td className="capitalize text-xs text-[var(--muted)]">{c.source}</Td>
                    <Td className="font-mono font-bold text-[var(--teal)]">{num(c.redemptionsCount || 0)}</Td>
                    <Td className="font-mono text-right text-[var(--ink)]">{inr(c.totalDiscountGiven || 0)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        {/* Recent Redemptions */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
            <div className="font-display font-bold text-base text-[var(--ink)]">Recent Redemptions</div>
            <Link href="/promo/usage-history" className="text-xs font-semibold text-[var(--violet)] hover:underline">
              Full Log →
            </Link>
          </div>
          {data?.recentRedemptions?.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--muted)]">No redemptions recorded yet.</div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Code Used</Th>
                  <Th>User</Th>
                  <Th>Discount Applied</Th>
                  <Th className="text-right">Date</Th>
                </tr>
              </thead>
              <tbody>
                {data?.recentRedemptions?.slice(0, 5).map((r) => (
                  <tr key={r._id} className="hover:bg-black/5 transition-colors">
                    <Td className="font-mono font-bold text-[var(--violet)]">{r.code}</Td>
                    <Td className="text-sm text-[var(--ink)]">{r.user || "Customer"}</Td>
                    <Td className="font-mono font-bold text-[var(--teal)]">{inr(r.discountApplied)}</Td>
                    <Td className="text-right text-xs text-[var(--muted)] font-mono">{dateShort(r.createdAt)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
