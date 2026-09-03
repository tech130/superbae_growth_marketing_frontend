"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr, dateShort, num } from "@/lib/format";
import { exportCsv } from "@/lib/csv";
import { PageHeader, Card, Table, Th, Td, Button, Loading, EmptyState, ErrorState } from "@/components/ui";
import { UserLoyaltyRow, LoyaltyReward } from "@/lib/types";

interface Redemption {
  id: string;
  userEmail: string;
  userName: string;
  rewardName: string;
  pointsSpent: number;
  redeemedAt: string;
  status: string;
}

export default function RedemptionHistoryPage() {
  const [rows, setRows] = useState<Redemption[] | null>(null);
  const [members, setMembers] = useState<UserLoyaltyRow[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [memberId, setMemberId] = useState("");
  const [rewardId, setRewardId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<Redemption[]>("/loyalty/redemptions").then((r) => setRows(r.reverse())).catch((e) => setError(e.message));
  }
  useEffect(load, []);
  useEffect(() => {
    api.get<UserLoyaltyRow[]>("/loyalty/members").then((m) => {
      setMembers(m);
      if (m.length) setMemberId(m[0].id);
    });
    api.get<LoyaltyReward[]>("/loyalty/rewards").then((r) => {
      setRewards(r.filter((x) => x.status === "Active"));
      if (r.length) setRewardId(r[0].id);
    });
  }, []);

  async function redeem() {
    try {
      await api.post("/loyalty/redeem", { memberId, rewardId });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  }

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Redemption History"
        subtitle="A full audit log of every loyalty redemption — points spent, rewards claimed, across all users."
        action={
          <div className="flex gap-2">
            <select className="input w-48" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.userName} ({num(m.pointsBalance)} pts)</option>
              ))}
            </select>
            <select className="input w-48" value={rewardId} onChange={(e) => setRewardId(e.target.value)}>
              {rewards.map((r) => (
                <option key={r.id} value={r.id}>{r.name} — {r.costPoints} pts</option>
              ))}
            </select>
            <Button onClick={redeem}>Redeem</Button>
            <Button variant="secondary" onClick={() => exportCsv("redemptions.csv", (rows || []) as unknown as Record<string, unknown>[])}>Export</Button>
          </div>
        }
      />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No redemptions yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>User</Th>
                <Th>Date</Th>
                <Th>Redeemed</Th>
                <Th>Points</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <Td className="font-medium">{r.userName}</Td>
                  <Td>{dateShort(r.redeemedAt)}</Td>
                  <Td>{r.rewardName}</Td>
                  <Td className="font-mono">{num(r.pointsSpent)} pts</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
