"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { num, dateShort } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Loading, EmptyState, ErrorState } from "@/components/ui";

interface Txn {
  id: string;
  userEmail: string;
  type: "earned" | "redeemed" | "expired" | "adjusted";
  amount: number;
  ruleName?: string;
  reason?: string;
  createdAt: string;
}

export default function LoyaltyPointsPage() {
  const [rows, setRows] = useState<Txn[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Txn[]>("/loyalty/points").then((r) => setRows(r.reverse())).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Points"
        subtitle="The points ledger for the loyalty program — every point earned and spent, backed by the shared Rewards & Wallet model."
      />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No point transactions yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>User</Th>
                <Th>Type</Th>
                <Th>Amount</Th>
                <Th>Reason / Rule</Th>
                <Th>Date</Th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 300).map((t) => (
                <tr key={t.id}>
                  <Td>{t.userEmail}</Td>
                  <Td><StatusBadge status={t.type === "earned" ? "Active" : t.type === "expired" ? "Expired" : t.type === "redeemed" ? "Pending" : "Investigating"} /></Td>
                  <Td className={`font-mono ${t.amount < 0 ? "text-[var(--coral)]" : "text-[var(--teal)]"}`}>{t.amount > 0 ? "+" : ""}{num(t.amount)}</Td>
                  <Td className="text-[12.5px] text-[var(--muted)]">{t.ruleName ?? t.reason ?? "—"}</Td>
                  <Td>{dateShort(t.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
