"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { inr, dateShort } from "@/lib/format";
import { PageHeader, Card, StatusBadge, Button, Loading, ErrorState } from "@/components/ui";
import { Commission } from "@/lib/types";

interface PayoutDetail {
  id: string;
  affiliate: string;
  partnerType: string;
  partnerCategory?: string;
  amount: number;
  netAmount?: number;
  taxDeducted?: number;
  method: string;
  status: string;
  initiatedOn: string;
  approvedOn?: string;
  approvedBy?: string;
  scheduledDate?: string;
  completedOn?: string;
  referenceId?: string;
  invoiceNumber?: string;
  invoiceGeneratedAt?: string;
  paymentDetails?: { method: string; accountRef: string };
  taxInfo?: string;
  commissions: Commission[];
}

export default function PayoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<PayoutDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<PayoutDetail>(`/payout-management/${id}`).then(setData).catch((e) => setError(e.message));
  }
  useEffect(load, [id]);

  if (error) return <ErrorState message={error} />;
  if (!data) return <Loading />;

  return (
    <div>
      <PageHeader
        title={`Payout — ${data.affiliate}`}
        subtitle="Exactly what this payout covers, and where the money went."
        action={
          !data.invoiceNumber && data.status === "Completed" ? (
            <Button onClick={() => api.post(`/payout-management/${id}/generate-invoice`).then(load)}>Generate invoice</Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-3 gap-5 mb-5">
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Overview</h2>
          <dl className="space-y-2 text-[13px]">
            <div className="flex justify-between"><dt className="text-[var(--muted)]">Partner</dt><dd>{data.affiliate} ({data.partnerType})</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--muted)]">Status</dt><dd><StatusBadge status={data.status} /></dd></div>
            <div className="flex justify-between"><dt className="text-[var(--muted)]">Amount</dt><dd className="font-mono">{inr(data.amount)}</dd></div>
            {data.taxDeducted !== undefined && <div className="flex justify-between"><dt className="text-[var(--muted)]">Tax deducted</dt><dd className="font-mono">{inr(data.taxDeducted)}</dd></div>}
            {data.netAmount !== undefined && <div className="flex justify-between"><dt className="text-[var(--muted)]">Net amount</dt><dd className="font-mono">{inr(data.netAmount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-[var(--muted)]">Method</dt><dd>{data.method}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--muted)]">Destination</dt><dd className="text-xs">{data.paymentDetails?.accountRef ?? "—"}</dd></div>
          </dl>
        </Card>
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Status History</h2>
          <ul className="space-y-2 text-[13px]">
            <li>Initiated — {dateShort(data.initiatedOn)}</li>
            {data.approvedOn && <li>Approved by {data.approvedBy} — {dateShort(data.approvedOn)}</li>}
            {data.scheduledDate && <li>Scheduled — {dateShort(data.scheduledDate)}</li>}
            {data.referenceId && <li>Processing — ref {data.referenceId}</li>}
            {data.completedOn && <li>Completed — {dateShort(data.completedOn)}</li>}
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Tax / Invoice</h2>
          <dl className="space-y-2 text-[13px]">
            <div className="flex justify-between"><dt className="text-[var(--muted)]">Tax ID</dt><dd className="text-xs">{data.taxInfo ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--muted)]">Invoice #</dt><dd className="font-mono text-xs">{data.invoiceNumber ?? "Not generated"}</dd></div>
            {data.invoiceGeneratedAt && <div className="flex justify-between"><dt className="text-[var(--muted)]">Generated</dt><dd>{dateShort(data.invoiceGeneratedAt)}</dd></div>}
          </dl>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="font-display font-semibold text-[15px] mb-3">Linked Commission Records</h2>
        {data.commissions.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No linked commissions.</p>
        ) : (
          <ul className="text-[13px] space-y-1.5">
            {data.commissions.map((c) => (
              <li key={c.id} className="flex justify-between border-b border-[var(--line)] pb-1.5">
                <span className="font-mono text-xs text-[var(--muted)]">{c.id.slice(-8)}</span>
                <span>{c.tier}</span>
                <span className="font-mono">{inr(c.amount)}</span>
                <StatusBadge status={c.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
