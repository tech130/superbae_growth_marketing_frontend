"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Campaign, Affiliate } from "@/lib/types";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

const categories = ["Fashion", "Beauty", "Wellness", "Travel", "Fitness", "Lifestyle", "Restaurants", "Experiences"];

export default function CampaignsPage() {
  const [rows, setRows] = useState<Campaign[] | null>(null);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ affiliateId: "", name: "", category: categories[0] });

  function load() {
    api.get<Campaign[]>("/campaigns").then(setRows).catch((e) => setError(e.message));
    api.get<Affiliate[]>("/affiliates?status=Active").then((rows) => {
      setAffiliates(rows);
      if (rows.length && !form.affiliateId) setForm((f) => ({ ...f, affiliateId: rows[0].id }));
    });
  }
  useEffect(load, []);

  const nameFor = (id: string) => affiliates.find((a) => a.id === id)?.name || id.slice(0, 6);

  async function createCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!form.affiliateId || !form.name) return;
    await api.post("/campaigns", form);
    setForm((f) => ({ ...f, name: "" }));
    load();
  }

  return (
    <div>
      <PageHeader title="Affiliate Campaigns" subtitle="Run a specific promotion — a seasonal push or category push — under an existing affiliate account." />

      <Card className="p-4 mb-5">
        <form onSubmit={createCampaign} className="flex items-end gap-3">
          <label className="text-xs">
            <div className="text-[var(--muted)] mb-1">Affiliate</div>
            <select
              className="input"
              value={form.affiliateId}
              onChange={(e) => setForm((f) => ({ ...f, affiliateId: e.target.value }))}
            >
              {affiliates.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
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
              placeholder="e.g. Diwali Push"
            />
          </label>
          <label className="text-xs">
            <div className="text-[var(--muted)] mb-1">Category</div>
            <select className="input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {categories.map((c) => (
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
          <EmptyState title="No campaigns yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Campaign</Th>
                <Th>Affiliate</Th>
                <Th>Category</Th>
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
                  <Td>{nameFor(c.affiliateId)}</Td>
                  <Td>{c.category}</Td>
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
