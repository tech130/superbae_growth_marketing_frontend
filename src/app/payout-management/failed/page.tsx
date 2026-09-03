"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { PayoutManagement } from "@/lib/types";
import { inr, dateShort } from "@/lib/format";
import { exportCsv } from "@/lib/csv";
import { PageHeader, Card, Table, Th, Td, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function FailedPayoutsPage() {
  const [rows, setRows] = useState<PayoutManagement[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<PayoutManagement[]>("/payout-management?status=Failed").then(setRows).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Failed"
        subtitle="Payouts that could not be completed — why a partner wasn't paid, and the ability to retry."
        action={
          <Button variant="secondary" onClick={() => exportCsv("failed-payouts.csv", (rows || []) as unknown as Record<string, unknown>[])}>
            Export
          </Button>
        }
      />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No failed payouts" subtitle="Nothing needs retrying right now." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Partner</Th>
                <Th>Amount</Th>
                <Th>Method</Th>
                <Th>Failed On</Th>
                <Th>Reason</Th>
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
                  <Td className="text-[var(--coral)] text-[12.5px]">{p.failureReason}</Td>
                  <Td>
                    <Button onClick={() => api.post(`/payout-management/${p.id}/retry`).then(load)}>Retry payout</Button>
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
