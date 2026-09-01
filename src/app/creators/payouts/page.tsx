"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Payout, Affiliate } from "@/lib/types";
import { inr, dateShort } from "@/lib/format";
import { exportCsv } from "@/lib/csv";
import { PageHeader, Card, KpiCard, Table, Th, Td, StatusBadge, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function CreatorPayoutsPage() {
  const [rows, setRows] = useState<Payout[] | null>(null);
  const [creators, setCreators] = useState<Affiliate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState("");

  function load() {
    api.get<Payout[]>("/creators/payouts").then((r) => setRows(r.reverse())).catch((e) => setError(e.message));
    api.get<Affiliate[]>("/creators?status=Active").then((rows) => {
      setCreators(rows);
      if (rows.length && !selected) setSelected(rows[0].id);
    });
  }
  useEffect(load, []);

  async function initiate() {
    try {
      await api.post("/payouts/initiate", { affiliateId: selected });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  }

  if (error) return <ErrorState message={error} />;

  const totals = rows
    ? rows.reduce(
        (acc, p) => {
          acc[p.status.toLowerCase() as "pending" | "processing" | "completed" | "failed"] += p.amount;
          return acc;
        },
        { pending: 0, processing: 0, completed: 0, failed: 0 }
      )
    : null;

  return (
    <div>
      <PageHeader
        title="Creator Payouts"
        subtitle="Money movement to creators — feeds from Approved Creator Commission and follows the shared Payout Schedule."
        action={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                exportCsv(
                  "creator-payouts.csv",
                  (rows || []).map((p) => ({
                    creator: p.creator,
                    amount: p.amount,
                    method: p.method,
                    status: p.status,
                    initiatedOn: p.initiatedOn,
                    completedOn: p.completedOn || "",
                  }))
                )
              }
            >
              Export
            </Button>
            <select className="input w-48" value={selected} onChange={(e) => setSelected(e.target.value)}>
              {creators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Button onClick={initiate}>Initiate payout</Button>
          </div>
        }
      />

      {totals && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <KpiCard label="Total Payable" value={inr(totals.pending + totals.processing)} accent="violet" />
          <KpiCard label="Pending" value={inr(totals.pending)} accent="amber" />
          <KpiCard label="Completed" value={inr(totals.completed)} accent="teal" />
          <KpiCard label="Failed" value={inr(totals.failed)} accent="coral" />
        </div>
      )}

      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No payouts yet" subtitle="Approve some creator commission, then initiate a payout." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Creator</Th>
                <Th>Amount</Th>
                <Th>Method</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <Td>{p.creator}</Td>
                  <Td className="font-mono">{inr(p.amount)}</Td>
                  <Td>{p.method}</Td>
                  <Td>
                    <StatusBadge status={p.status} />
                  </Td>
                  <Td>{dateShort(p.initiatedOn)}</Td>
                  <Td>
                    {(p.status === "Pending" || p.status === "Processing") && (
                      <Button variant="secondary" onClick={() => api.post(`/payouts/${p.id}/advance`).then(load)}>
                        Advance
                      </Button>
                    )}
                    {p.status === "Failed" && (
                      <Button variant="secondary" onClick={() => api.post(`/payouts/${p.id}/retry`).then(load)}>
                        Retry
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
