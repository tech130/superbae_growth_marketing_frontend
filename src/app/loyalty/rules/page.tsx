"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { LoyaltyRule } from "@/lib/types";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function LoyaltyRulesPage() {
  const [rows, setRows] = useState<LoyaltyRule[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<LoyaltyRule[]>("/loyalty/rules").then(setRows).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Loyalty Rules"
        subtitle="Decide when and how a user earns loyalty points — every rule here is what credits points on real activity, kept separate from tier definitions."
      />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No rules yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Rule</Th>
                <Th>Trigger</Th>
                <Th>Points / Reward</Th>
                <Th>Limit</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <Td className="font-medium">{r.name}</Td>
                  <Td>{r.trigger}</Td>
                  <Td className="font-mono">{r.rewardType === "points" ? `${r.points} points` : `₹${r.walletAmount} wallet credit`}</Td>
                  <Td>{r.limit}</Td>
                  <Td><StatusBadge status={r.status} /></Td>
                  <Td>
                    <Button variant="secondary" onClick={() => api.post(`/loyalty/rules/${r.id}/toggle`).then(load)}>
                      {r.status === "Active" ? "Deactivate" : "Activate"}
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
