"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { AffiliateLink, Affiliate } from "@/lib/types";
import { num } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function CreatorReferralLinksPage() {
  const [rows, setRows] = useState<AffiliateLink[] | null>(null);
  const [creators, setCreators] = useState<Affiliate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    api.get<AffiliateLink[]>("/creators/links").then((r) => setRows(r.reverse())).catch((e) => setError(e.message));
    api.get<Affiliate[]>("/creators?status=Active").then((rows) => {
      setCreators(rows);
      if (rows.length && !selected) setSelected(rows[0].id);
    });
  }
  useEffect(load, []);

  async function createLink() {
    if (!selected) return;
    setBusy("new");
    try {
      await api.post("/creators/links", { creatorId: selected });
      load();
    } finally {
      setBusy(null);
    }
  }

  async function disable(id: string) {
    setBusy(id);
    try {
      await api.post(`/links/${id}/disable`);
      load();
    } finally {
      setBusy(null);
    }
  }
  async function enable(id: string) {
    setBusy(id);
    try {
      await api.post(`/links/${id}/enable`);
      load();
    } finally {
      setBusy(null);
    }
  }
  async function regenerate(id: string) {
    setBusy(id);
    try {
      await api.post(`/links/${id}/regenerate`);
      load();
    } finally {
      setBusy(null);
    }
  }

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Creator Referral Links"
        subtitle="Tracking links issued to creators — the creator equivalent of Affiliate Links."
        action={
          <div className="flex gap-2">
            <select className="input w-52" value={selected} onChange={(e) => setSelected(e.target.value)}>
              {creators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Button disabled={busy === "new"} onClick={createLink}>
              Create link
            </Button>
          </div>
        }
      />

      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No creator links yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Link</Th>
                <Th>Creator</Th>
                <Th>Clicks</Th>
                <Th>Leads</Th>
                <Th>Conversions</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id}>
                  <Td className="font-mono text-[12.5px] text-[var(--violet)]">{l.url}</Td>
                  <Td>{l.creator}</Td>
                  <Td className="font-mono">{num(l.clicks)}</Td>
                  <Td className="font-mono">{num(l.leads)}</Td>
                  <Td className="font-mono">{num(l.conversions)}</Td>
                  <Td>
                    <StatusBadge status={l.status} />
                  </Td>
                  <Td>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="secondary"
                        onClick={() => navigator.clipboard?.writeText(l.url)}
                      >
                        Copy
                      </Button>
                      <Button variant="secondary" disabled={busy === l.id} onClick={() => regenerate(l.id)}>
                        Regenerate
                      </Button>
                      {l.status === "Active" ? (
                        <Button variant="secondary" disabled={busy === l.id} onClick={() => disable(l.id)}>
                          Disable
                        </Button>
                      ) : (
                        <Button variant="secondary" disabled={busy === l.id} onClick={() => enable(l.id)}>
                          Enable
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
