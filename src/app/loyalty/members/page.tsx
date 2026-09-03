"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { UserLoyaltyRow, LoyaltyTier } from "@/lib/types";
import { num, dateShort } from "@/lib/format";
import { exportCsv } from "@/lib/csv";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

const FILTERS = [
  { value: "", label: "All members" },
  { value: "high-points", label: "High points" },
  { value: "close-to-upgrade", label: "Close to upgrade" },
  { value: "inactive", label: "Inactive" },
];

export default function UserTierListPage() {
  const [rows, setRows] = useState<UserLoyaltyRow[] | null>(null);
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  function load() {
    const params = filter ? `?filter=${filter}` : "";
    api.get<UserLoyaltyRow[]>(`/loyalty/members${params}`).then(setRows).catch((e) => setError(e.message));
  }
  useEffect(load, [filter]);
  useEffect(() => {
    api.get<LoyaltyTier[]>("/loyalty/tiers").then(setTiers).catch(() => undefined);
  }, []);

  async function adjustPoints(id: string) {
    const amount = prompt("Points to add (negative to deduct):");
    if (!amount) return;
    try {
      await api.post(`/loyalty/members/${id}/adjust-points`, { amount: Number(amount), reason: "Manual adjustment" });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function overrideTier(id: string) {
    const tierName = prompt(`Override tier to (${tiers.map((t) => t.name).join(" / ")}):`);
    const tier = tiers.find((t) => t.name.toLowerCase() === tierName?.toLowerCase());
    if (!tier) return;
    await api.post(`/loyalty/members/${id}/override-tier`, { tierId: tier.id });
    load();
  }

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="User Tier List"
        subtitle="Every user's current tier, points balance, and progress toward the next tier — the master list of loyalty members."
        action={
          <div className="flex gap-2">
            <select className="input w-48" value={filter} onChange={(e) => setFilter(e.target.value)}>
              {FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <Button variant="secondary" onClick={() => exportCsv("loyalty-members.csv", (rows || []) as unknown as Record<string, unknown>[])}>Export</Button>
          </div>
        }
      />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No members match this filter" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>User</Th>
                <Th>Current Tier</Th>
                <Th>Points</Th>
                <Th>To Next Tier</Th>
                <Th>Last Active</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <Td className="font-medium">{m.userName}<div className="text-[11px] text-[var(--muted)]">{m.userEmail}</div></Td>
                  <Td>{m.tierName}</Td>
                  <Td className="font-mono">{num(m.pointsBalance)}</Td>
                  <Td>{m.pointsToNextTier ? `${num(m.pointsToNextTier)} to ${m.nextTierName}` : "Max tier"}</Td>
                  <Td>{dateShort(m.lastActivityAt)}</Td>
                  <Td><StatusBadge status={m.status} /></Td>
                  <Td className="flex gap-2">
                    <Button variant="secondary" onClick={() => adjustPoints(m.id)}>Adjust points</Button>
                    <Button variant="secondary" onClick={() => overrideTier(m.id)}>Override tier</Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
