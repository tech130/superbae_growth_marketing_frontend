"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { PayoutManagement } from "@/lib/types";
import { inr, dateShort } from "@/lib/format";
import { exportCsv } from "@/lib/csv";
import { PageHeader, Card, Table, Th, Td, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function ProcessingPayoutsPage() {
  const [rows, setRows] = useState<PayoutManagement[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<PayoutManagement[]>("/payout-management?status=Processing").then(setRows).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Processing"
        subtitle="Payouts initiated with the payment provider (bank transfer / UPI) and in flight — not yet confirmed complete or failed."
        action={
          <Button variant="secondary" onClick={() => exportCsv("processing-payouts.csv", (rows || []) as unknown as Record<string, unknown>[])}>
            Export
          </Button>
        }
      />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="Nothing in flight" subtitle="Send an Approved payout to processing to see it here." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Partner</Th>
                <Th>Amount</Th>
                <Th>Method</Th>
                <Th>Initiated On</Th>
                <Th>Reference ID</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <Td className="font-medium">
                    <Link href={`/payout-management/${p.id}`} className="hover:underline">
                      {p.affiliate}
                    </Link>
                  </Td>
                  <Td className="font-mono">{inr(p.amount)}</Td>
                  <Td>{p.method}</Td>
                  <Td>{dateShort(p.initiatedOn)}</Td>
                  <Td className="font-mono text-xs">{p.referenceId ?? "—"}</Td>
                  <Td className="flex gap-2">
                    <Button onClick={() => api.post(`/payout-management/${p.id}/settle`).then(load)}>Refresh from provider</Button>
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
