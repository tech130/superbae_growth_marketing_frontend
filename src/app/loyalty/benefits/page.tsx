"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { LoyaltyBenefit } from "@/lib/types";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function LoyaltyBenefitsPage() {
  const [rows, setRows] = useState<LoyaltyBenefit[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<LoyaltyBenefit[]>("/loyalty/benefits").then(setRows).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Benefits"
        subtitle="The non-redeemable perks automatically granted by holding a tier — discounts, priority support, early access, and exclusive content."
      />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No benefits yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Benefit</Th>
                <Th>Applies To Tier</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id}>
                  <Td className="font-medium">{b.name}</Td>
                  <Td>{b.minTierName}+</Td>
                  <Td className="capitalize">{b.type}</Td>
                  <Td><StatusBadge status={b.status} /></Td>
                  <Td>
                    <Button variant="secondary" onClick={() => api.post(`/loyalty/benefits/${b.id}/toggle`).then(load)}>
                      {b.status === "Active" ? "Disable" : "Enable"}
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
