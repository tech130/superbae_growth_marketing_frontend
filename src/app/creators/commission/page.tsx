"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Commission } from "@/lib/types";
import { inr, dateShort } from "@/lib/format";
import { exportCsv } from "@/lib/csv";
import { PageHeader, Card, KpiCard, Table, Th, Td, StatusBadge, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

type Tab = "All" | "Pending" | "Approved" | "Rejected" | "Paid";
const TABS: Tab[] = ["All", "Pending", "Approved", "Rejected", "Paid"];

export default function CreatorCommissionPage() {
  const [tab, setTab] = useState<Tab>("All");
  const [rows, setRows] = useState<Commission[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    const path = tab === "All" ? "/creators/commission" : `/creators/commission?status=${tab}`;
    api.get<Commission[]>(path).then((r) => setRows(r.reverse())).catch((e) => setError(e.message));
  }
  useEffect(load, [tab]);

  async function adjust(id: string) {
    const amountStr = window.prompt("Adjustment amount (₹) — positive to add, negative to deduct:");
    if (amountStr === null) return;
    const amount = Number(amountStr);
    if (Number.isNaN(amount) || amount === 0) return;
    const reason = window.prompt("Reason for adjustment?") || "Manual adjustment";
    await api.post(`/commissions/${id}/adjust`, { amount, reason });
    load();
  }

  if (error) return <ErrorState message={error} />;

  const summary = (rows || []).reduce(
    (acc, c) => {
      acc.total += c.amount;
      if (c.status === "Pending") acc.pending += c.amount;
      if (c.status === "Approved") acc.approved += c.amount;
      if (c.status === "Rejected") acc.rejected += c.amount;
      if (c.status === "Paid") acc.paid += c.amount;
      return acc;
    },
    { total: 0, pending: 0, approved: 0, rejected: 0, paid: 0 }
  );

  return (
    <div>
      <PageHeader
        title="Creator Commission"
        subtitle="The commission ledger for creators — calculated by the shared Affiliate Commission Engine under the Premium Creator tier (30% of first subscription)."
        action={
          <Button
            variant="secondary"
            onClick={() =>
              exportCsv(
                "creator-commission.csv",
                (rows || []).map((c) => ({
                  creator: c.creator,
                  amount: c.amount,
                  status: c.status,
                  reason: c.rejectedReason || "",
                  calculatedOn: c.calculatedOn,
                  approvedOn: c.approvedOn || "",
                }))
              )
            }
          >
            Export
          </Button>
        }
      />

      {rows && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          <KpiCard label="Total" value={inr(summary.total)} accent="violet" />
          <KpiCard label="Pending" value={inr(summary.pending)} accent="amber" />
          <KpiCard label="Approved" value={inr(summary.approved)} accent="teal" />
          <KpiCard label="Rejected" value={inr(summary.rejected)} accent="coral" />
          <KpiCard label="Paid" value={inr(summary.paid)} accent="teal" />
        </div>
      )}

      <div className="flex gap-1 mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-medium ${
              tab === t ? "bg-[var(--violet)] text-white" : "bg-white border border-[var(--line)] text-[var(--muted)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title={`No ${tab === "All" ? "" : tab.toLowerCase()} commission records`} />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Creator</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Reason</Th>
                <Th>Calculated on</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <Td>{c.creator}</Td>
                  <Td className="font-mono">{inr(c.amount)}</Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={c.status} />
                      {c.status === "Pending" && !c.eligibleForApproval && (
                        <span className="text-[10px] text-[var(--muted)]">holding period</span>
                      )}
                    </div>
                  </Td>
                  <Td className="text-[12px] text-[var(--muted)] max-w-[220px]">{c.rejectedReason || "—"}</Td>
                  <Td>{dateShort(c.calculatedOn)}</Td>
                  <Td>
                    <div className="flex gap-2 flex-wrap">
                      {c.status === "Pending" && (
                        <>
                          <Button onClick={() => api.post(`/commissions/${c.id}/approve`).then(load)}>Approve</Button>
                          <Button
                            variant="secondary"
                            onClick={() =>
                              api
                                .post(`/commissions/${c.id}/reject`, { reason: window.prompt("Reason?") || "Not specified" })
                                .then(load)
                            }
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {(c.status === "Pending" || c.status === "Approved") && (
                        <Button variant="secondary" onClick={() => adjust(c.id)}>
                          Adjust
                        </Button>
                      )}
                      {c.status === "Approved" && (
                        <Button
                          variant="secondary"
                          onClick={() =>
                            api
                              .post(`/commissions/${c.id}/reverse`, { reason: window.prompt("Reversal reason?") || "Fraud found" })
                              .then(load)
                          }
                        >
                          Reverse
                        </Button>
                      )}
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
