"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr, num } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, Loading, ErrorState } from "@/components/ui";

type LeaderboardRow = {
  rank: number;
  userId: number;
  totalReferrals: number;
  successful: number;
  conversionRate: number;
  rewards: number;
};

export default function ReferralLeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get<LeaderboardRow[]>("/admin/leaderboard");
      setRows(res || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && rows.length === 0) return <Loading />;
  if (error && rows.length === 0) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referral Leaderboard"
        subtitle="Top advocate rankings by total confirmed subscription conversions and cumulative wallet rewards."
        action={
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] px-4 py-2 text-sm font-medium hover:bg-[var(--violet-dim)] transition-colors"
          >
            Refresh
          </button>
        }
      />

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">No leaderboard data recorded yet.</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Rank</Th>
                <Th>User Account</Th>
                <Th>Total Invited</Th>
                <Th>Successful Conversions</Th>
                <Th>Conversion Rate</Th>
                <Th className="text-right">Rewards Earned</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.userId} className="hover:bg-black/5 transition-colors">
                  <Td className="font-mono font-bold text-[var(--violet)]">#{row.rank}</Td>
                  <Td className="font-semibold text-[var(--ink)]">User #{row.userId}</Td>
                  <Td className="font-mono text-[var(--muted)]">{num(row.totalReferrals)}</Td>
                  <Td className="font-mono font-bold text-[var(--teal)]">{num(row.successful)}</Td>
                  <Td className="font-mono text-[var(--ink)]">{row.conversionRate}%</Td>
                  <Td className="font-mono font-bold text-right text-[var(--teal)]">{inr(row.rewards)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
