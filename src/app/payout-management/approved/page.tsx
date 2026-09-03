"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { PayoutManagement } from "@/lib/types";
import { inr, dateShort } from "@/lib/format";
import { exportCsv } from "@/lib/csv";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function ApprovedPayoutsPage() {
  const [rows, setRows] = useState<PayoutManagement[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<PayoutManagement[]>("/payout-management?status=Approved").then(setRows).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Approved Payouts"
        subtitle="Cleared review and confirmed ready to be sent — the queue that feeds Processing."
        action={
          <Button variant="secondary" onClick={() => exportCsv("approved-payouts.csv", (rows || []) as unknown as Record<string, unknown>[])}>
            Export
          </Button>
        }
      />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="Nothing approved yet" subtitle="Approve a Pending payout to see it here." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Partner</Th>
                <Th>Type</Th>
                <Th>Amount</Th>
                <Th>Approved On</Th>
                <Th>Approved By</Th>
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
                  <Td>{p.partnerType}</Td>
                  <Td className="font-mono">{inr(p.amount)}</Td>
                  <Td>{p.approvedOn ? dateShort(p.approvedOn) : "—"}</Td>
                  <Td>{p.approvedBy ?? "—"}</Td>
                  <Td>
                    <Button onClick={() => api.post(`/payout-management/${p.id}/send-to-processing`).then(load).catch((e) => alert(e.message))}>
                      Send to processing
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
