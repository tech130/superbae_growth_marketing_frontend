"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { CampaignRecord } from "@/lib/types";
import { inr, num, dateShort } from "@/lib/format";
import { PageHeader, Card, StatusBadge, Button, Loading, ErrorState } from "@/components/ui";

type Tab = "Overview" | "Audience" | "Funnel" | "Budget" | "Attribution";
const TABS: Tab[] = ["Overview", "Audience", "Funnel", "Budget", "Attribution"];

export default function CampaignDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [c, setC] = useState<CampaignRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("Overview");
  const [busy, setBusy] = useState(false);

  function load() {
    api.get<CampaignRecord>(`/campaign-management/${id}`).then(setC).catch((e) => setError(e.message));
  }
  useEffect(load, [id]);

  async function act(action: "pause" | "resume" | "end" | "simulate") {
    setBusy(true);
    try {
      await api.post(`/campaign-management/${id}/${action}`);
      load();
    } finally {
      setBusy(false);
    }
  }

  if (error) return <ErrorState message={error} />;
  if (!c) return <Loading />;

  const f = c.funnel;
  const remaining = c.budget !== undefined ? c.budget - c.spend : undefined;
  const cpa = f.subscriptions > 0 ? c.spend / f.subscriptions : 0;

  return (
    <div>
      <PageHeader
        title={c.name}
        subtitle={`${c.sourceType} campaign${c.linkedRefLabel ? ` · ${c.linkedRefLabel}` : ""}`}
        action={
          <div className="flex gap-2">
            {c.status === "Active" && (
              <Button variant="secondary" disabled={busy} onClick={() => act("pause")}>
                Pause
              </Button>
            )}
            {c.status === "Paused" && (
              <Button variant="secondary" disabled={busy} onClick={() => act("resume")}>
                Resume
              </Button>
            )}
            {c.status !== "Ended" && (
              <Button variant="secondary" disabled={busy} onClick={() => act("end")}>
                End
              </Button>
            )}
            {c.status === "Active" && (
              <Button disabled={busy} onClick={() => act("simulate")}>
                Simulate activity
              </Button>
            )}
          </div>
        }
      />

      <div className="flex items-center gap-2 mb-4">
        <StatusBadge status={c.status} />
        <span className="text-xs text-[var(--muted)]">Category: {c.category}</span>
        <span className="text-xs text-[var(--muted)]">· Starts {dateShort(c.startDate)}</span>
        {c.endDate && <span className="text-xs text-[var(--muted)]">· Ends {dateShort(c.endDate)}</span>}
      </div>

      <div className="flex gap-1 mb-5 border-b border-[var(--line)]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? "border-[var(--violet)] text-[var(--violet)]" : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid grid-cols-3 gap-5">
          <Card className="col-span-2 p-5">
            <dl className="grid grid-cols-2 gap-y-3 text-[13.5px]">
              <Row label="Source type" value={c.sourceType} />
              <Row label="Linked to" value={c.linkedRefLabel || "—"} />
              <Row label="Category" value={c.category} />
              <Row label="Tracking link" value={c.trackingLink} mono />
              <Row label="Landing page" value={c.landingPage || "—"} />
              <Row label="Status" value={c.status} />
            </dl>
          </Card>
          <Card className="p-5">
            <h2 className="font-display font-semibold text-[15px] mb-3">Snapshot</h2>
            <div className="space-y-2 text-[13.5px]">
              <Metric label="Revenue" value={inr(f.revenue)} />
              <Metric label="Spend" value={inr(c.spend)} />
              <Metric label="Subscriptions" value={num(f.subscriptions)} />
              <Metric label="Cost / acquisition" value={inr(Math.round(cpa))} />
            </div>
          </Card>
        </div>
      )}

      {tab === "Audience" && (
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Audience Targeting</h2>
          <dl className="grid grid-cols-2 gap-y-3 text-[13.5px] max-w-lg">
            <Row label="Category" value={c.audience.category || "—"} />
            <Row label="New vs existing" value={c.audience.newVsExisting || "—"} />
            <Row label="Geography" value={c.audience.geography || "—"} />
            <Row label="Platform" value={c.audience.platform || "—"} />
            <Row label="Age range" value={c.audience.ageRange || "—"} />
          </dl>
        </Card>
      )}

      {tab === "Funnel" && (
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-4">Impressions → Clicks → Installs → Signups → Subscriptions → Revenue</h2>
          <ol className="relative border-l border-[var(--line)] pl-4 space-y-4 text-[13px]">
            {[
              { label: "Impressions", value: num(f.impressions) },
              { label: "Clicks", value: num(f.clicks) },
              { label: "Installs", value: num(f.installs) },
              { label: "Signups", value: num(f.signups) },
              { label: "Subscriptions", value: num(f.subscriptions) },
              { label: "Revenue", value: inr(f.revenue) },
            ].map((step) => (
              <li key={step.label} className="relative flex items-baseline justify-between max-w-md">
                <span className="flex items-center gap-2">
                  <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-[var(--violet)]" />
                  {step.label}
                </span>
                <span className="font-mono font-medium">{step.value}</span>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {tab === "Budget" && (
        <Card className="p-5 max-w-lg">
          <h2 className="font-display font-semibold text-[15px] mb-3">Spend Cap & Cost Tracking</h2>
          <dl className="grid grid-cols-2 gap-y-3 text-[13.5px]">
            <Row label="Total budget" value={c.budget !== undefined ? inr(c.budget) : "No cap set"} />
            <Row label="Spent" value={inr(c.spend)} />
            <Row label="Remaining" value={remaining !== undefined ? inr(Math.max(0, remaining)) : "—"} />
            <Row label="Cost / subscription" value={inr(Math.round(cpa))} />
            <Row label="Auto-pause on exhaustion" value={c.autoPauseOnBudgetExhausted ? "On" : "Off"} />
          </dl>
        </Card>
      )}

      {tab === "Attribution" && (
        <Card className="p-5 max-w-lg">
          <h2 className="font-display font-semibold text-[15px] mb-3">Attribution</h2>
          <dl className="grid grid-cols-2 gap-y-3 text-[13.5px]">
            <Row label="Source type" value={c.sourceType} />
            <Row label="Linked reference" value={c.linkedRefLabel || "—"} />
            <Row label="Tracking link" value={c.trackingLink} mono />
          </dl>
          {(c.sourceType === "Affiliate" || c.sourceType === "Influencer") && c.linkedRefId && (
            <Link
              href={c.sourceType === "Influencer" ? `/creators/${c.linkedRefId}` : `/affiliates/${c.linkedRefId}`}
              className="text-sm text-[var(--violet)] hover:underline mt-3 inline-block"
            >
              View {c.sourceType === "Influencer" ? "creator" : "affiliate"} profile →
            </Link>
          )}
        </Card>
      )}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <>
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className={mono ? "font-mono text-[12.5px]" : ""}>{value}</dd>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-mono font-medium">{value}</span>
    </div>
  );
}
