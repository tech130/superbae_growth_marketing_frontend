"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { PayoutManagement } from "@/lib/types";
import { inr, dateShort } from "@/lib/format";
import { exportCsv } from "@/lib/csv";
import { PageHeader, Card, Table, Th, Td, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function TaxInvoiceDetailsPage() {
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
        title="Tax / Invoice Details"
        subtitle="The compliance record finance needs for every partner payment — gross amount, tax deducted at source, and net paid."
        action={
          <Button variant="secondary" onClick={() => exportCsv("tax-invoices.csv", (rows || []) as unknown as Record<string, unknown>[])}>
            Export for accounting
          </Button>
        }
      />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No completed payouts yet" subtitle="Invoices are generated once a payout completes." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Partner</Th>
                <Th>Invoice #</Th>
                <Th>Gross</Th>
                <Th>Tax Deducted (TDS)</Th>
                <Th>Net Paid</Th>
                <Th>Paid On</Th>
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
                  <Td className="font-mono text-xs">{p.invoiceNumber ?? "—"}</Td>
                  <Td className="font-mono">{inr(p.amount)}</Td>
                  <Td className="font-mono">{p.taxDeducted !== undefined ? inr(p.taxDeducted) : "—"}</Td>
                  <Td className="font-mono">{p.netAmount !== undefined ? inr(p.netAmount) : inr(p.amount)}</Td>
                  <Td>{p.completedOn ? dateShort(p.completedOn) : "—"}</Td>
                  <Td>
                    {!p.invoiceNumber && (
                      <Button variant="secondary" onClick={() => api.post(`/payout-management/${p.id}/generate-invoice`).then(load)}>
                        Generate
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
