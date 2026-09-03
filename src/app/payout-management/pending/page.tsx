"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { PayoutManagement, Affiliate } from "@/lib/types";
import { inr, dateShort } from "@/lib/format";
import { exportCsv } from "@/lib/csv";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function PendingPayoutsPage() {
  const [rows, setRows] = useState<PayoutManagement[] | null>(null);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<PayoutManagement[]>("/payout-management?status=Pending").then(setRows).catch((e) => setError(e.message));
    api.get<Affiliate[]>("/affiliates?status=Active").then((rows) => {
      setAffiliates(rows);
      if (rows.length && !selected) setSelected(rows[0].id);
    });
  }
  useEffect(load, []);

  async function queue() {
    try {
      await api.post("/payout-management/queue", { affiliateId: selected });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  }

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Pending Payouts"
        subtitle="Approved commission queued for payment — waiting on the next scheduled payout run or admin approval."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => exportCsv("pending-payouts.csv", (rows || []) as unknown as Record<string, unknown>[])}>
              Export
            </Button>
            <select className="input w-48" value={selected} onChange={(e) => setSelected(e.target.value)}>
              {affiliates.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <Button onClick={queue}>Queue payout</Button>
          </div>
        }
      />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="Nothing pending" subtitle="Queue a payout for a partner with approved commission." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Partner</Th>
                <Th>Type</Th>
                <Th>Amount</Th>
                <Th>Method</Th>
                <Th>Scheduled Date</Th>
                <Th>Status</Th>
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
                  <Td>{p.method}</Td>
                  <Td>{p.scheduledDate ? dateShort(p.scheduledDate) : "—"}</Td>
                  <Td>
                    <StatusBadge status={p.status} />
                  </Td>
                  <Td>
                    <div className="flex gap-2">
                      <Button onClick={() => api.post(`/payout-management/${p.id}/approve`).then(load).catch((e) => alert(e.message))}>
                        Approve
                      </Button>
                      <Button variant="secondary" onClick={() => api.post(`/payout-management/${p.id}/hold`).then(load)}>
                        Hold
                      </Button>
                    </div>
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
