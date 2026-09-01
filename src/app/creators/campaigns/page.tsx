"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Campaign, Affiliate } from "@/lib/types";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

const CATEGORIES = ["Fashion", "Beauty", "Wellness", "Travel", "Fitness", "Lifestyle", "Restaurants", "Experiences"];
const CONTENT_TYPES = ["Reel", "Video", "Story", "Post"];

export default function CreatorCampaignsPage() {
  const [rows, setRows] = useState<Campaign[] | null>(null);
  const [creators, setCreators] = useState<Affiliate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ creatorId: "", name: "", category: CATEGORIES[0], contentType: CONTENT_TYPES[0] });

  function load() {
    api.get<Campaign[]>("/creators/campaigns").then((r) => setRows(r.reverse())).catch((e) => setError(e.message));
    api.get<Affiliate[]>("/creators?status=Active").then((rows) => {
      setCreators(rows);
      if (rows.length && !form.creatorId) setForm((f) => ({ ...f, creatorId: rows[0].id }));
    });
  }
  useEffect(load, []);

  async function createCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!form.creatorId || !form.name) return;
    await api.post("/creators/campaigns", form);
    setForm((f) => ({ ...f, name: "" }));
    load();
  }

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Creator Campaigns"
        subtitle="Let a creator run a specific promotion — a launch video or story series — under their existing account."
      />

      <Card className="p-4 mb-5">
        <form onSubmit={createCampaign} className="flex items-end gap-3 flex-wrap">
          <label className="text-xs">
            <div className="text-[var(--muted)] mb-1">Creator</div>
            <select className="input" value={form.creatorId} onChange={(e) => setForm((f) => ({ ...f, creatorId: e.target.value }))}>
              {creators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs flex-1">
            <div className="text-[var(--muted)] mb-1">Campaign name</div>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Wellness Launch"
            />
          </label>
          <label className="text-xs">
            <div className="text-[var(--muted)] mb-1">Category</div>
            <select className="input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            <div className="text-[var(--muted)] mb-1">Content type</div>
            <select className="input" value={form.contentType} onChange={(e) => setForm((f) => ({ ...f, contentType: e.target.value }))}>
              {CONTENT_TYPES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <Button type="submit">Create campaign</Button>
        </form>
      </Card>

      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No creator campaigns yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Campaign</Th>
                <Th>Creator</Th>
                <Th>Category</Th>
                <Th>Content type</Th>
                <Th>Clicks</Th>
                <Th>Conversions</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <Td className="font-medium">{c.name}</Td>
                  <Td>{c.creator}</Td>
                  <Td>{c.category}</Td>
                  <Td>{c.contentType || "—"}</Td>
                  <Td className="font-mono">{c.clicks}</Td>
                  <Td className="font-mono">{c.conversions}</Td>
                  <Td>
                    <StatusBadge status={c.status} />
                  </Td>
                  <Td>
                    <div className="flex gap-2">
                      {c.status === "Active" && (
                        <Button variant="secondary" onClick={() => api.post(`/campaigns/${c.id}/pause`).then(load)}>
                          Pause
                        </Button>
                      )}
                      {c.status === "Paused" && (
                        <Button variant="secondary" onClick={() => api.post(`/campaigns/${c.id}/resume`).then(load)}>
                          Resume
                        </Button>
                      )}
                      {c.status !== "Ended" && (
                        <Button variant="secondary" onClick={() => api.post(`/campaigns/${c.id}/end`).then(load)}>
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
