"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { inr, num } from "@/lib/format";
import { PageHeader, KpiCard, Card, Table, Th, Td, Loading, ErrorState } from "@/components/ui";

type DashboardKpis = {
  totalReferrals: number;
  successful: number;
  pending: number;
  rejected: number;
  totalRewardsGiven: number;
  conversionRate: number;
  linkClicks: number;
};

type TopReferrer = {
  _id: number;
  totalReferrals: number;
  successful: number;
};

export default function ReferralDashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kpiData, topData] = await Promise.all([
        api.get<DashboardKpis>("/admin/dashboard/kpis"),
        api.get<TopReferrer[]>("/admin/dashboard/top-referrers").catch(() => []),
      ]);
      setKpis(kpiData);
      setTopReferrers(topData || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load referral dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !kpis) return <Loading />;
  if (error && !kpis) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referral Dashboard"
        subtitle="Live performance metrics, acquisition volume, and conversion economics from the referral engine."
        action={
          <div className="flex gap-2">
            <Link
              href="/referral/rules"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--violet)] text-white px-4 py-2 text-sm font-medium hover:bg-[#b03d82] transition-colors"
            >
              Configure Rules
            </Link>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] px-4 py-2 text-sm font-medium hover:bg-[var(--violet-dim)] transition-colors"
            >
              Refresh
            </button>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Referrals"
          value={num(kpis?.totalReferrals || 0)}
          hint={`${kpis?.pending || 0} pending verification`}
          accent="violet"
        />
        <KpiCard
          label="Successful Conversions"
          value={num(kpis?.successful || 0)}
          hint={`${kpis?.conversionRate || 0}% conversion rate`}
          accent="teal"
        />
        <KpiCard
          label="Total Rewards Paid"
          value={inr(kpis?.totalRewardsGiven || 0)}
          hint="Credited to user wallets"
          accent="amber"
        />
        <KpiCard
          label="Link Clicks Tracked"
          value={num(kpis?.linkClicks || 0)}
          hint="Across all referral URLs"
          accent="coral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Links & Status Card */}
        <Card className="p-5 lg:col-span-1 space-y-4">
          <div className="font-display font-bold text-lg text-[var(--ink)]">Quick Actions</div>
          <div className="space-y-2">
            <Link
              href="/referral/pending"
              className="flex items-center justify-between p-3 rounded-lg border border-[var(--line)] hover:border-[var(--violet)] transition-colors text-sm"
            >
              <span className="font-medium text-[var(--ink)]">Review Pending Referrals</span>
              <span className="font-mono font-bold text-[var(--amber)]">{kpis?.pending || 0}</span>
            </Link>
            <Link
              href="/referral/rewards"
              className="flex items-center justify-between p-3 rounded-lg border border-[var(--line)] hover:border-[var(--violet)] transition-colors text-sm"
            >
              <span className="font-medium text-[var(--ink)]">Reward Approvals & Ledger</span>
              <span className="text-xs text-[var(--muted)]">Manage →</span>
            </Link>
            <Link
              href="/referral/funnel"
              className="flex items-center justify-between p-3 rounded-lg border border-[var(--line)] hover:border-[var(--violet)] transition-colors text-sm"
            >
              <span className="font-medium text-[var(--ink)]">Full Conversion Funnel</span>
              <span className="text-xs text-[var(--muted)]">View →</span>
            </Link>
            <Link
              href="/referral/fraud"
              className="flex items-center justify-between p-3 rounded-lg border border-[var(--line)] hover:border-[var(--violet)] transition-colors text-sm"
            >
              <span className="font-medium text-[var(--ink)]">Fraud & Risk Evaluation</span>
              <span className="text-xs text-[var(--muted)]">Audit →</span>
            </Link>
          </div>
        </Card>

        {/* Top Referrers */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-display font-bold text-lg text-[var(--ink)]">Top Referrers</div>
              <p className="text-xs text-[var(--muted)]">Users generating highest volume of conversions</p>
            </div>
            <Link href="/referral/leaderboard" className="text-xs font-semibold text-[var(--violet)] hover:underline">
              Full Leaderboard →
            </Link>
          </div>

          {topReferrers.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--muted)]">No referral data recorded yet.</div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>User ID</Th>
                  <Th>Total Invited</Th>
                  <Th>Successful Conversions</Th>
                  <Th>Conversion Rate</Th>
                </tr>
              </thead>
              <tbody>
                {topReferrers.map((row) => (
                  <tr key={row._id} className="hover:bg-black/5 transition-colors">
                    <Td className="font-mono font-semibold text-[var(--ink)]">User #{row._id}</Td>
                    <Td className="font-mono text-[var(--muted)]">{row.totalReferrals}</Td>
                    <Td className="font-mono font-bold text-[var(--teal)]">{row.successful}</Td>
                    <Td className="font-mono text-[var(--ink)]">
                      {row.totalReferrals ? ((row.successful / row.totalReferrals) * 100).toFixed(1) : 0}%
                    </Td>
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
