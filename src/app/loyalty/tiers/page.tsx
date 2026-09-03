"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { LoyaltyTier, LoyaltyBenefit } from "@/lib/types";
import { num } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function LoyaltyTiersPage() {
  const [rows, setRows] = useState<LoyaltyTier[] | null>(null);
  const [benefits, setBenefits] = useState<LoyaltyBenefit[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<LoyaltyTier[]>("/loyalty/tiers").then(setRows).catch((e) => setError(e.message));
    api.get<LoyaltyBenefit[]>("/loyalty/benefits").then(setBenefits).catch(() => undefined);
  }, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Tiers"
        subtitle="The loyalty tier ladder — Bae Starter → Bae Plus → Bae Premium → Bae VIP — the threshold to reach each tier and the benefits attached to it."
      />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No tiers yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Tier</Th>
                <Th>Threshold</Th>
                <Th>Key Benefits</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <Td className="font-medium">{t.name}</Td>
                  <Td className="font-mono">{num(t.thresholdPoints)} points</Td>
                  <Td className="text-[12.5px] text-[var(--muted)]">
                    {benefits.filter((b) => b.minTierId === t.id).map((b) => b.name).join(", ") || "—"}
                  </Td>
                  <Td><StatusBadge status={t.status} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
