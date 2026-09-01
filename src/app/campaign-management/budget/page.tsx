"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { CampaignRecord } from "@/lib/types";
import { inr } from "@/lib/format";
import { exportCsv } from "@/lib/csv";
import { PageHeader, Card, Table, Th, Td, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function CampaignBudgetPage() {
  const [rows, setRows] = useState<CampaignRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    api.get<CampaignRecord[]>("/campaign-management").then(setRows).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  async function editBudget(c: CampaignRecord) {
    const value = window.prompt("Set budget (₹):", String(c.budget ?? ""));
    if (value === null) return;
    const budget = Number(value);
    if (Number.isNaN(budget) || budget < 0) return;
    setBusy(c.id);
    try {
      await api.patch(`/campaign-management/${c.id}`, { budget });
      load();
    } finally {
      setBusy(null);
    }
  }

  async function extendBudget(c: CampaignRecord) {
    const value = window.prompt("Add to current budget (₹):", "50000");
    if (value === null) return;
    const extra = Number(value);
    if (Number.isNaN(extra) || extra <= 0) return;
    setBusy(c.id);
    try {
      await api.patch(`/campaign-management/${c.id}`, { budget: (c.budget ?? 0) + extra });
      load();
    } finally {
      setBusy(null);
    }
  }

  async function toggleAutoPause(c: CampaignRecord) {
    setBusy(c.id);
    try {
      await api.patch(`/campaign-management/${c.id}`, { autoPauseOnBudgetExhausted: !c.autoPauseOnBudgetExhausted });
      load();
    } finally {
      setBusy(null);
    }
  }

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Campaign Budget"
        subtitle="Spend caps and cost tracking per campaign — prevents overspending and gives finance a real-time cost view."
        action={
          <Button
            variant="secondary"
            onClick={() =>
              exportCsv(
                "campaign-budget.csv",
                (rows || []).map((c) => ({
                  campaign: c.name,
                  budget: c.budget ?? "",
                  spent: c.spend,
                  remaining: c.budget !== undefined ? Math.max(0, c.budget - c.spend) : "",
                  cpa: c.funnel.subscriptions > 0 ? Math.round(c.spend / c.funnel.subscriptions) : 0,
                }))
              )
            }
          >
            Export spend report
          </Button>
        }
      />

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
                <Th>Budget</Th>
                <Th>Spent</Th>
                <Th>Remaining</Th>
                <Th>CPA</Th>
                <Th>Auto-pause</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const remaining = c.budget !== undefined ? Math.max(0, c.budget - c.spend) : undefined;
                const cpa = c.funnel.subscriptions > 0 ? Math.round(c.spend / c.funnel.subscriptions) : 0;
                return (
                  <tr key={c.id}>
                    <Td className="font-medium">
                      <Link href={`/campaign-management/${c.id}`} className="hover:text-[var(--violet)]">
                        {c.name}
                      </Link>
                    </Td>
                    <Td className="font-mono">{c.budget !== undefined ? inr(c.budget) : "No cap"}</Td>
                    <Td className="font-mono">{inr(c.spend)}</Td>
                    <Td className="font-mono">{remaining !== undefined ? inr(remaining) : "—"}</Td>
                    <Td className="font-mono">{inr(cpa)}</Td>
                    <Td>
                      <label className="flex items-center gap-1.5 text-[12px] text-[var(--muted)]">
                        <input
                          type="checkbox"
                          checked={c.autoPauseOnBudgetExhausted}
                          disabled={busy === c.id}
                          onChange={() => toggleAutoPause(c)}
                        />
                        {c.autoPauseOnBudgetExhausted ? "On" : "Off"}
                      </label>
                    </Td>
                    <Td>
                      <div className="flex gap-2">
                        <Button variant="secondary" disabled={busy === c.id} onClick={() => editBudget(c)}>
                          Set budget
                        </Button>
                        <Button variant="secondary" disabled={busy === c.id} onClick={() => extendBudget(c)}>
                          Extend
                        </Button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
