"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Affiliate } from "@/lib/types";
import { inr, num, dateShort } from "@/lib/format";
import { exportCsv } from "@/lib/csv";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, ErrorState, EmptyState } from "@/components/ui";

const CATEGORIES = ["Fashion", "Beauty", "Wellness", "Travel", "Fitness", "Lifestyle", "Restaurants", "Experiences"];
const PLATFORMS = ["Instagram", "YouTube", "TikTok", "Facebook", "X", "Other"];

function platformsFor(a: Affiliate) {
  return Array.from(new Set((a.socialProfiles || []).map((p) => p.platform))).join(", ") || "—";
}

export default function CreatorListPage() {
  const [rows, setRows] = useState<Affiliate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [platform, setPlatform] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    if (platform) params.set("platform", platform);
    api
      .get<Affiliate[]>(`/creators?${params.toString()}`)
      .then(setRows)
      .catch((e) => setError(e.message));
  }
  useEffect(load, [q, status, category, platform]);

  async function suspend(id: string) {
    setBusy(id);
    try {
      await api.post(`/creators/${id}/suspend`);
      load();
    } finally {
      setBusy(null);
    }
  }
  async function ban(id: string) {
    if (!window.confirm("Ban this creator? This is a hard block on their account.")) return;
    setBusy(id);
    try {
      await api.post(`/creators/${id}/ban`);
      load();
    } finally {
      setBusy(null);
    }
  }
  async function reinstate(id: string) {
    setBusy(id);
    try {
      await api.patch(`/creators/${id}`, { status: "Active" });
      load();
    } finally {
      setBusy(null);
    }
  }

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Creator List"
        subtitle="Every onboarded creator — platform, reach, referral code and performance in one searchable master list."
        action={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                exportCsv(
                  "creators.csv",
                  (rows || []).map((a) => ({
                    name: a.name,
                    category: a.category,
                    platforms: platformsFor(a),
                    reach: a.reach ?? 0,
                    status: a.status,
                    conversions: a.performance?.conversions ?? 0,
                    commissionEarned: a.performance?.commissionEarned ?? 0,
                    joined: a.createdAt,
                  }))
                )
              }
            >
              Export
            </Button>
            <Link href="/creators/new">
              <Button>+ Add Creator</Button>
            </Link>
          </div>
        }
      />

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email…"
          className="px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-white w-64 outline-none focus:ring-2 focus:ring-[var(--violet)]"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-40">
          <option value="">All statuses</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Suspended</option>
          <option>Rejected</option>
          <option>Banned</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input w-40">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="input w-40">
          <option value="">All platforms</option>
          {PLATFORMS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>

      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No creators match this filter" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Creator</Th>
                <Th>Category</Th>
                <Th>Platform(s)</Th>
                <Th>Reach</Th>
                <Th>Conversions</Th>
                <Th>Commission</Th>
                <Th>Joined</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="hover:bg-[var(--paper)]">
                  <Td className="font-medium">
                    <Link href={`/creators/${a.id}`} className="hover:text-[var(--violet)]">
                      {a.name}
                    </Link>
                  </Td>
                  <Td>{a.category}</Td>
                  <Td>{platformsFor(a)}</Td>
                  <Td className="font-mono">{num(a.reach ?? 0)}</Td>
                  <Td className="font-mono">{num(a.performance?.conversions ?? 0)}</Td>
                  <Td className="font-mono">{inr(a.performance?.commissionEarned ?? 0)}</Td>
                  <Td>{dateShort(a.createdAt)}</Td>
                  <Td>
                    <StatusBadge status={a.status} />
                  </Td>
                  <Td>
                    <div className="flex gap-2">
                      <Link href={`/creators/${a.id}/edit`}>
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
