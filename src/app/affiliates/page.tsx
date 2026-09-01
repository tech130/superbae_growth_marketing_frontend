"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Affiliate } from "@/lib/types";
import { inr, num, dateShort } from "@/lib/format";
import { exportCsv } from "@/lib/csv";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, ErrorState, EmptyState } from "@/components/ui";

const TIERS = ["Standard", "Premium Creator", "Brand Partner"];

export default function AffiliateListPage() {
  const [rows, setRows] = useState<Affiliate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [tier, setTier] = useState("");
  const [highPerforming, setHighPerforming] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (tier) params.set("tier", tier);
    api
      .get<Affiliate[]>(`/affiliates?${params.toString()}`)
      .then(setRows)
      .catch((e) => setError(e.message));
  }

  useEffect(load, [q, status, tier]);

  async function suspend(id: string) {
    setBusy(id);
    try {
      await api.post(`/affiliates/${id}/suspend`);
      load();
    } finally {
      setBusy(null);
    }
  }

  async function ban(id: string) {
    if (!window.confirm("Ban this affiliate? This is a hard block on their account.")) return;
    setBusy(id);
    try {
      await api.post(`/affiliates/${id}/ban`);
      load();
    } finally {
      setBusy(null);
    }
  }

  async function reinstate(id: string) {
    setBusy(id);
    try {
      await api.patch(`/affiliates/${id}`, { status: "Active" });
      load();
    } finally {
      setBusy(null);
    }
  }

  if (error) return <ErrorState message={error} />;

  // "High performing" — top quartile by commission earned among currently loaded rows.
  let displayRows = rows;
  if (rows && highPerforming) {
    const sorted = [...rows].sort((a, b) => (b.performance?.commissionEarned ?? 0) - (a.performance?.commissionEarned ?? 0));
    const cutoffIdx = Math.max(0, Math.ceil(sorted.length * 0.25) - 1);
    const cutoff = sorted[cutoffIdx]?.performance?.commissionEarned ?? 0;
    displayRows = rows.filter((a) => (a.performance?.commissionEarned ?? 0) >= cutoff && (a.performance?.commissionEarned ?? 0) > 0);
  }

  return (
    <div>
      <PageHeader
        title="Affiliate List"
        subtitle="Every onboarded partner — tier, tracking link, performance and status in one searchable master list."
        action={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                exportCsv(
                  "affiliates.csv",
                  (displayRows || []).map((a) => ({
                    name: a.name,
                    company: a.company || "",
                    email: a.email,
                    tier: a.tier,
                    status: a.status,
                    clicks: a.performance?.totalClicks ?? 0,
                    leads: a.performance?.leads ?? 0,
                    conversions: a.performance?.conversions ?? 0,
                    commissionEarned: a.performance?.commissionEarned ?? 0,
                    joined: a.createdAt,
                  }))
                )
              }
            >
              Export
            </Button>
            <Link href="/affiliates/new">
              <Button>+ Add Affiliate</Button>
            </Link>
          </div>
        }
      />

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, company, email…"
          className="px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-white w-72 outline-none focus:ring-2 focus:ring-[var(--violet)]"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-white outline-none"
        >
          <option value="">All statuses</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Suspended</option>
          <option>Rejected</option>
          <option>Banned</option>
        </select>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-white outline-none"
        >
          <option value="">All tiers</option>
          {TIERS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-sm text-[var(--muted)] px-2">
          <input type="checkbox" checked={highPerforming} onChange={(e) => setHighPerforming(e.target.checked)} />
          High performing
        </label>
      </div>

      <Card>
        {!rows ? (
          <Loading />
        ) : displayRows!.length === 0 ? (
          <EmptyState title="No affiliates match this filter" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Affiliate</Th>
                <Th>Company / Brand</Th>
                <Th>Tier</Th>
                <Th>Clicks</Th>
                <Th>Conversions</Th>
                <Th>Commission</Th>
                <Th>Joined</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {displayRows!.map((a) => (
                <tr key={a.id} className="hover:bg-[var(--paper)]">
                  <Td className="font-medium">
                    <Link href={`/affiliates/${a.id}`} className="hover:text-[var(--violet)]">
                      {a.name}
                    </Link>
                  </Td>
                  <Td>{a.company || "—"}</Td>
                  <Td>{a.tier}</Td>
                  <Td className="font-mono">{num(a.performance?.totalClicks ?? 0)}</Td>
                  <Td className="font-mono">{num(a.performance?.conversions ?? 0)}</Td>
                  <Td className="font-mono">{inr(a.performance?.commissionEarned ?? 0)}</Td>
                  <Td>{dateShort(a.createdAt)}</Td>
                  <Td>
                    <StatusBadge status={a.status} />
                  </Td>
                  <Td>
                    <div className="flex gap-2">
                      <Link href={`/affiliates/${a.id}/edit`}>
                        <Button variant="secondary" disabled={busy === a.id}>
                          Edit
                        </Button>
                      </Link>
                      {a.status === "Active" && (
                        <Button variant="secondary" disabled={busy === a.id} onClick={() => suspend(a.id)}>
                          Suspend
                        </Button>
                      )}
                      {(a.status === "Suspended" || a.status === "Banned") && (
                        <Button variant="secondary" disabled={busy === a.id} onClick={() => reinstate(a.id)}>
                          Reinstate
                        </Button>
                      )}
                      {(a.status === "Active" || a.status === "Suspended") && (
                        <Button variant="danger" disabled={busy === a.id} onClick={() => ban(a.id)}>
                          Ban
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
