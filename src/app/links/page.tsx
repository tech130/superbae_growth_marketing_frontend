"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { AffiliateLink, Affiliate } from "@/lib/types";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function LinksPage() {
  const [rows, setRows] = useState<AffiliateLink[] | null>(null);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftCode, setDraftCode] = useState("");
  const [draftUrl, setDraftUrl] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);

  function load() {
    api.get<AffiliateLink[]>("/links").then(setRows).catch((e) => setError(e.message));
    api.get<Affiliate[]>("/affiliates?status=Active").then(setAffiliates).catch(() => {});
  }
  useEffect(load, []);

  const nameFor = (id: string) => affiliates.find((a) => a.id === id)?.name || id.slice(0, 6);

  function startEdit(l: AffiliateLink) {
    setEditingId(l.id);
    setDraftCode(l.code);
    setDraftUrl(l.url);
    setSaveError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setSaveError(null);
  }

  async function saveEdit(id: string) {
    setSaveError(null);
    try {
      await api.patch(`/links/${id}`, { code: draftCode, url: draftUrl });
      setEditingId(null);
      load();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save");
    }
  }

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader title="Affiliate Links" subtitle="Tracking links and referral codes issued to affiliates, and how each one is performing." />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No links yet" subtitle="Links are created automatically when an affiliate is approved." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Affiliate Link</Th>
                <Th>Owner</Th>
                <Th>Clicks</Th>
                <Th>Leads</Th>
                <Th>Conversions</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) =>
                editingId === l.id ? (
                  <tr key={l.id}>
                    <Td colSpan={7}>
                      <div className="flex items-end gap-3 flex-wrap py-1">
                        <label className="text-xs">
                          <div className="text-[var(--muted)] mb-1">Code</div>
                          <input className="input w-40" value={draftCode} onChange={(e) => setDraftCode(e.target.value)} />
                        </label>
                        <label className="text-xs flex-1 min-w-[220px]">
                          <div className="text-[var(--muted)] mb-1">URL</div>
                          <input className="input" value={draftUrl} onChange={(e) => setDraftUrl(e.target.value)} />
                        </label>
                        <Button onClick={() => saveEdit(l.id)}>Save</Button>
                        <Button variant="secondary" onClick={cancelEdit}>
                          Cancel
                        </Button>
                        {saveError && <span className="text-xs text-[var(--coral)]">{saveError}</span>}
                      </div>
                    </Td>
                  </tr>
                ) : (
                  <tr key={l.id}>
                    <Td className="font-mono text-[var(--violet)]">{l.url}</Td>
                    <Td>{nameFor(l.affiliateId)}</Td>
                    <Td className="font-mono">{l.clicks}</Td>
                    <Td className="font-mono">{l.leads}</Td>
                    <Td className="font-mono">{l.conversions}</Td>
                    <Td>
                      <StatusBadge status={l.status} />
                    </Td>
                    <Td>
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="secondary" onClick={() => startEdit(l)}>
                          Edit
                        </Button>
                        <Button variant="secondary" onClick={() => api.post(`/links/${l.id}/regenerate`).then(load)}>
                          Regenerate
                        </Button>
                        {l.status === "Active" ? (
                          <Button variant="secondary" onClick={() => api.post(`/links/${l.id}/disable`).then(load)}>
                            Disable
                          </Button>
                        ) : (
                          <Button onClick={() => api.post(`/links/${l.id}/enable`).then(load)}>Enable</Button>
                        )}
                      </div>
                    </Td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
