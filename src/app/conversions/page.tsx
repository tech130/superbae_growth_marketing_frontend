"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Conversion, Lead, Affiliate } from "@/lib/types";
import { inr, dateShort } from "@/lib/format";
import { exportCsv } from "@/lib/csv";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function ConversionsPage() {
  const [rows, setRows] = useState<Conversion[] | null>(null);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [awaitingLeads, setAwaitingLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ leadId: "", subscriptionPlan: "Premium", revenue: 999 });
  const [notice, setNotice] = useState<string | null>(null);

  function load() {
    api.get<Conversion[]>("/conversions").then((r) => setRows(r.reverse())).catch((e) => setError(e.message));
    api.get<Affiliate[]>("/affiliates").then(setAffiliates).catch(() => {});
    api.get<Lead[]>("/leads").then((leads) => {
      const awaiting = leads.filter((l) => l.stage === "Awaiting Subscription");
      setAwaitingLeads(awaiting);
      if (awaiting.length) setForm((f) => ({ ...f, leadId: f.leadId || awaiting[0].id }));
    });
  }
  useEffect(load, []);

  const nameFor = (id: string) => affiliates.find((a) => a.id === id)?.name || id.slice(0, 6);

  async function recordConversion(e: React.FormEvent) {
    e.preventDefault();
    if (!form.leadId) return;
    setNotice(null);
    try {
      const result = await api.post<{ fraudFlag: any; commission: any }>("/conversions", {
        leadId: form.leadId,
        subscriptionPlan: form.subscriptionPlan,
        revenue: Number(form.revenue),
      });
      setNotice(
        result.fraudFlag
          ? `Recorded. Commission ${inr(result.commission.amount)} calculated — flagged ${result.fraudFlag.riskLevel} risk for review.`
          : `Recorded. Commission ${inr(result.commission.amount)} calculated and set to Pending.`
      );
      load();
    } catch (e: any) {
      setNotice(e.message);
    }
  }

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Affiliate Conversions"
        subtitle="Completed, qualified conversions — leads that became paying subscribers within the attribution window. Recording one here calculates commission and runs fraud scoring immediately."
        action={
          <Button
            variant="secondary"
            onClick={() =>
              exportCsv(
                "conversions.csv",
                (rows || []).map((c) => ({
                  affiliate: nameFor(c.affiliateId),
                  user: c.userName,
                  convertedOn: c.convertedOn,
                  plan: c.subscriptionPlan,
                  revenue: c.revenue,
                  status: c.status,
                }))
              )
            }
          >
            Export
          </Button>
        }
      />

      <Card className="p-4 mb-5">
        <form onSubmit={recordConversion} className="flex items-end gap-3">
          <label className="text-xs flex-1">
            <div className="text-[var(--muted)] mb-1">Lead awaiting subscription</div>
            <select className="input" value={form.leadId} onChange={(e) => setForm((f) => ({ ...f, leadId: e.target.value }))}>
              {awaitingLeads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.userName} — {nameFor(l.affiliateId)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            <div className="text-[var(--muted)] mb-1">Plan</div>
            <select className="input" value={form.subscriptionPlan} onChange={(e) => setForm((f) => ({ ...f, subscriptionPlan: e.target.value }))}>
              <option>Premium</option>
              <option>Premium Annual</option>
              <option>Plus</option>
            </select>
          </label>
          <label className="text-xs">
            <div className="text-[var(--muted)] mb-1">Revenue (₹)</div>
            <input
              type="number"
              className="input w-28"
              value={form.revenue}
              onChange={(e) => setForm((f) => ({ ...f, revenue: Number(e.target.value) }))}
            />
          </label>
          <Button type="submit" disabled={!awaitingLeads.length}>
            Record subscription payment
          </Button>
        </form>
        {notice && <p className="text-xs text-[var(--violet)] mt-2">{notice}</p>}
        {!awaitingLeads.length && <p className="text-xs text-[var(--muted)] mt-2">No leads currently awaiting subscription.</p>}
      </Card>

      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No conversions yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Affiliate</Th>
                <Th>Converted user</Th>
                <Th>Converted on</Th>
                <Th>Subscription</Th>
                <Th>Revenue</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <Td>{nameFor(c.affiliateId)}</Td>
                  <Td className="font-medium">{c.userName}</Td>
                  <Td>{dateShort(c.convertedOn)}</Td>
                  <Td>{c.subscriptionPlan}</Td>
                  <Td className="font-mono">{inr(c.revenue)}</Td>
                  <Td>
                    <StatusBadge status={c.status} />
                  </Td>
                  <Td>
                    {c.status === "Valid" && (
                      <Button variant="secondary" onClick={() => api.post(`/conversions/${c.id}/flag-invalid`).then(load)}>
                        Flag invalid
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
