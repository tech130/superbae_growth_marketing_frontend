"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { num } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Loading, EmptyState, ErrorState } from "@/components/ui";

interface Row {
  rank: number;
  userName: string;
  userEmail: string;
  tier: string;
  pointsEarned: number;
  redemptions: number;
}

const PERIODS = [
  { value: "all", label: "All time" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
];

export default function LoyaltyLeaderboardPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [period, setPeriod] = useState("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRows(null);
    api.get<Row[]>(`/loyalty/leaderboard?period=${period}`).then(setRows).catch((e) => setError(e.message));
  }, [period]);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Leaderboard"
        subtitle="Ranks the most engaged loyalty members by points earned — used for gamification and seasonal loyalty competitions."
        action={
          <select className="input w-40" value={period} onChange={(e) => setPeriod(e.target.value)}>
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        }
      />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No members yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Rank</Th>
                <Th>User</Th>
                <Th>Tier</Th>
                <Th>Points Earned</Th>
                <Th>Redemptions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 50).map((r) => (
                <tr key={r.userEmail}>
                  <Td className="font-mono">{r.rank}</Td>
                  <Td className="font-medium">{r.userName}</Td>
                  <Td><StatusBadge status={r.tier} /></Td>
                  <Td className="font-mono">{num(r.pointsEarned)}</Td>
                  <Td className="font-mono">{r.redemptions}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
