"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { PayoutManagement } from "@/lib/types";
import { inr, dateShort } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function BrandPayoutsManagementPage() {
  const [rows, setRows] = useState<PayoutManagement[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<PayoutManagement[]>("/payout-management?partnerType=Brand").then(setRows).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader title="Brand Payouts" subtitle="The payout ledger filtered to brand partners." />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No brand payouts yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Brand</Th>
                <Th>Amount</Th>
                <Th>Method</Th>
                <Th>Status</Th>
                <Th>Date</Th>
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
                  <Td><StatusBadge status={p.status} /></Td>
                  <Td>{dateShort(p.initiatedOn)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
