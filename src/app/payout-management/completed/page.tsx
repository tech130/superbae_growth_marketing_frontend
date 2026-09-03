"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { PayoutManagement } from "@/lib/types";
import { inr, dateShort } from "@/lib/format";
import { exportCsv } from "@/lib/csv";
import { PageHeader, Card, Table, Th, Td, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function CompletedPayoutsPage() {
  const [rows, setRows] = useState<PayoutManagement[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<PayoutManagement[]>("/payout-management?status=Completed").then(setRows).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Completed"
        subtitle="Successfully paid payouts — the permanent, auditable record of money that has reached a partner."
        action={
          <Button variant="secondary" onClick={() => exportCsv("completed-payouts.csv", (rows || []) as unknown as Record<string, unknown>[])}>
            Export
          </Button>
        }
      />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="Nothing completed yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Partner</Th>
                <Th>Amount</Th>
                <Th>Method</Th>
                <Th>Paid On</Th>
                <Th>Reference ID</Th>
                <Th>Invoice</Th>
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
                  <Td>{p.completedOn ? dateShort(p.completedOn) : "—"}</Td>
                  <Td className="font-mono text-xs">{p.referenceId ?? "—"}</Td>
                  <Td>
                    {p.invoiceNumber ? (
                      <span className="font-mono text-xs">{p.invoiceNumber}</span>
                    ) : (
                      <Button variant="secondary" onClick={() => api.post(`/payout-management/${p.id}/generate-invoice`).then(load)}>
                        Generate invoice
                      </Button>
                    )}
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
