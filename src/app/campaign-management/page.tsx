"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { CampaignRecord } from "@/lib/types";
import { inr, num, dateShort } from "@/lib/format";
import { exportCsv } from "@/lib/csv";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

const SOURCE_TYPES = ["Referral", "Affiliate", "Influencer", "Promo", "Coupon"];
const STATUSES = ["Draft", "Active", "Paused", "Ended"];

export default function CampaignListPage() {
  const [rows, setRows] = useState<CampaignRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (sourceType) params.set("sourceType", sourceType);
    if (status) params.set("status", status);
    api
      .get<CampaignRecord[]>(`/campaign-management?${params.toString()}`)
      .then((r) => setRows(r.reverse()))
      .catch((e) => setError(e.message));
  }
  useEffect(load, [q, sourceType, status]);

  async function pause(id: string) {
    setBusy(id);
    try {
      await api.post(`/campaign-management/${id}/pause`);
      load();
    } finally {
      setBusy(null);
    }
  }
  async function resume(id: string) {
    setBusy(id);
    try {
      await api.post(`/campaign-management/${id}/resume`);
      load();
    } finally {
      setBusy(null);
    }
  }
  async function end(id: string) {
    setBusy(id);
    try {
      await api.post(`/campaign-management/${id}/end`);
      load();
    } finally {
      setBusy(null);
    }
  }

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Campaign List"
        subtitle="Every campaign across every acquisition source — Referral, Affiliate, Influencer, Promo and Coupon — in one searchable master list."
        action={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                exportCsv(
                  "campaigns.csv",
                  (rows || []).map((c) => ({
                    name: c.name,
                    sourceType: c.sourceType,
                    status: c.status,
                    clicks: c.funnel.clicks,
                    subscriptions: c.funnel.subscriptions,
                    revenue: c.funnel.revenue,
                    budget: c.budget ?? "",
                    spend: c.spend,
                    startDate: c.startDate,
                  }))
                )
              }
            >
              Export
            </Button>
            <Link href="/campaign-management/new">
              <Button>+ Create Campaign</Button>
            </Link>
          </div>
        }
      />

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search campaign name…"
          className="px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-white w-64 outline-none focus:ring-2 focus:ring-[var(--violet)]"
        />
        <select value={sourceType} onChange={(e) => setSourceType(e.target.value)} className="input w-40">
          <option value="">All sources</option>
          {SOURCE_TYPES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-36">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No campaigns match this filter" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Campaign</Th>
                <Th>Source Type</Th>
                <Th>Status</Th>
                <Th>Clicks</Th>
                <Th>Subscriptions</Th>
                <Th>Revenue</Th>
                <Th>Start date</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--paper)]">
                  <Td className="font-medium">
                    <Link href={`/campaign-management/${c.id}`} className="hover:text-[var(--violet)]">
                      {c.name}
                    </Link>
                  </Td>
                  <Td>{c.sourceType}</Td>
                  <Td>
                    <StatusBadge status={c.status} />
                  </Td>
                  <Td className="font-mono">{num(c.funnel.clicks)}</Td>
                  <Td className="font-mono">{num(c.funnel.subscriptions)}</Td>
                  <Td className="font-mono">{inr(c.funnel.revenue)}</Td>
                  <Td>{dateShort(c.startDate)}</Td>
                  <Td>
                    <div className="flex gap-2">
                      {c.status === "Active" && (
                        <Button variant="secondary" disabled={busy === c.id} onClick={() => pause(c.id)}>
                          Pause
                        </Button>
                      )}
                      {c.status === "Paused" && (
                        <Button variant="secondary" disabled={busy === c.id} onClick={() => resume(c.id)}>
                          Resume
                        </Button>
                      )}
                      {c.status !== "Ended" && (
                        <Button variant="secondary" disabled={busy === c.id} onClick={() => end(c.id)}>
                          End
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
