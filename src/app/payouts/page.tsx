"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Payout, Affiliate } from "@/lib/types";
import { inr, dateShort } from "@/lib/format";
import { exportCsv } from "@/lib/csv";
import { PageHeader, Card, KpiCard, Table, Th, Td, StatusBadge, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function PayoutsPage() {
  const [rows, setRows] = useState<Payout[] | null>(null);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState("");

  function load() {
    api.get<Payout[]>("/payouts").then((r) => setRows(r.reverse())).catch((e) => setError(e.message));
    api.get<Affiliate[]>("/affiliates?status=Active").then((rows) => {
      setAffiliates(rows);
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

  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${lastMonthDate.getMonth()}`;
  const monthTotals = rows
    ? rows.reduce(
        (acc, p) => {
          const d = new Date(p.initiatedOn);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          if (key === thisMonthKey) acc.thisMonth += p.amount;
          if (key === lastMonthKey) acc.lastMonth += p.amount;
          return acc;
        },
        { thisMonth: 0, lastMonth: 0 }
      )
    : null;

  return (
    <div>
      <PageHeader
        title="Payout History"
        subtitle="Money movement to affiliates — feeds from Approved Commission and follows the payout schedule."
        action={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                exportCsv(
                  "payouts.csv",
                  (rows || []).map((p) => ({
                    affiliate: p.affiliate,
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
              {affiliates.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <Button onClick={initiate}>Initiate payout</Button>
          </div>
        }
      />

      {totals && monthTotals && (
        <div className="grid grid-cols-4 gap-4 mb-3">
          <KpiCard label="Total Payable" value={inr(totals.pending + totals.processing)} accent="violet" />
          <KpiCard label="Pending" value={inr(totals.pending)} accent="amber" />
          <KpiCard label="Processing" value={inr(totals.processing)} accent="violet" />
          <KpiCard label="Completed" value={inr(totals.completed)} accent="teal" />
        </div>
      )}
      {totals && monthTotals && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <KpiCard label="Failed" value={inr(totals.failed)} accent="coral" />
          <KpiCard label="This Month" value={inr(monthTotals.thisMonth)} accent="teal" />
          <KpiCard label="Last Month" value={inr(monthTotals.lastMonth)} accent="violet" />
        </div>
      )}

      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No payouts yet" subtitle="Approve some commission, then initiate a payout for an affiliate." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Affiliate</Th>
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
                  <Td>{p.affiliate}</Td>
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
