"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { LoyaltyReward } from "@/lib/types";
import { num } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function LoyaltyRewardsPage() {
  const [rows, setRows] = useState<LoyaltyReward[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<LoyaltyReward[]>("/loyalty/rewards").then(setRows).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Rewards"
        subtitle="The catalog of what loyalty points and tiers can be redeemed for — the loyalty-specific view into rewards issued through Rewards & Wallet."
      />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No rewards yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Reward</Th>
                <Th>Type</Th>
                <Th>Cost (Points)</Th>
                <Th>Min. Tier</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <Td className="font-medium">{r.name}</Td>
                  <Td className="capitalize">{r.type.replace("_", " ")}</Td>
                  <Td className="font-mono">{num(r.costPoints)}</Td>
                  <Td>{r.minTierName}</Td>
                  <Td><StatusBadge status={r.status} /></Td>
                  <Td>
                    <Button variant="secondary" onClick={() => api.post(`/loyalty/rewards/${r.id}/toggle`).then(load)}>
                      {r.status === "Active" ? "Disable" : "Enable"}
                    </Button>
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
