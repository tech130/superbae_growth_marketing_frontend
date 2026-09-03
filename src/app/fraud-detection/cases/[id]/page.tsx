"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { FraudCase } from "@/lib/types";
import { inr, dateShort } from "@/lib/format";
import { PageHeader, Card, StatusBadge, Button, Loading, ErrorState } from "@/components/ui";

export default function InvestigationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [kase, setKase] = useState<FraudCase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");

  function load() {
    api.get<FraudCase>(`/fraud-detection/${id}`).then(setKase).catch((e) => setError(e.message));
  }
  useEffect(load, [id]);

  async function addNote() {
    if (!note.trim()) return;
    await api.post(`/fraud-detection/${id}/note`, { text: note, author: "Admin" });
    setNote("");
    load();
  }

  if (error) return <ErrorState message={error} />;
  if (!kase) return <Loading />;

  const open = kase.status === "Flagged" || kase.status === "Investigating" || kase.status === "On Hold";

  return (
    <div>
      <PageHeader
        title={`Case — ${kase.subjectLabel}`}
        subtitle={`Risk Score: ${kase.riskScore}/100 — Risk Level: ${kase.riskLevel}`}
        action={
          open ? (
            <div className="flex gap-2 flex-wrap">
              <Button variant="secondary" onClick={() => api.post(`/fraud-detection/${id}/hold`).then(load)}>
                Hold
              </Button>
              <Button onClick={() => api.post(`/fraud-detection/${id}/legitimate`).then(load)}>Mark legitimate</Button>
              <Button variant="danger" onClick={() => api.post(`/fraud-detection/${id}/confirm-fraud`).then(load)}>
                Confirm fraud
              </Button>
              <Button variant="secondary" onClick={() => api.post(`/fraud-detection/${id}/suspend-subject`).then(load)}>
                Suspend subject
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="grid grid-cols-3 gap-5 mb-5">
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Case Summary</h2>
          <dl className="space-y-2 text-[13px]">
            <div className="flex justify-between"><dt className="text-[var(--muted)]">Fraud Type</dt><dd>{kase.fraudType}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--muted)]">Source</dt><dd>{kase.sourceType}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--muted)]">Status</dt><dd><StatusBadge status={kase.status} /></dd></div>
            {kase.deviceId && <div className="flex justify-between"><dt className="text-[var(--muted)]">Device</dt><dd className="font-mono text-xs">{kase.deviceId}</dd></div>}
            {kase.ip && <div className="flex justify-between"><dt className="text-[var(--muted)]">IP</dt><dd className="font-mono text-xs">{kase.ip}</dd></div>}
            {kase.relatedSubjectLabel && <div className="flex justify-between"><dt className="text-[var(--muted)]">Related</dt><dd>{kase.relatedSubjectLabel}</dd></div>}
          </dl>
        </Card>
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Hold</h2>
          <dl className="space-y-2 text-[13px]">
            <div className="flex justify-between"><dt className="text-[var(--muted)]">Hold Type</dt><dd>{kase.holdType ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--muted)]">Amount On Hold</dt><dd className="font-mono">{kase.holdAmount ? inr(kase.holdAmount) : "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--muted)]">Flagged</dt><dd>{dateShort(kase.createdAt)}</dd></div>
            {kase.resolvedAt && <div className="flex justify-between"><dt className="text-[var(--muted)]">Resolved</dt><dd>{dateShort(kase.resolvedAt)}</dd></div>}
          </dl>
        </Card>
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Evidence</h2>
          {kase.linkedIds && kase.linkedIds.length > 0 ? (
            <ul className="text-[12.5px] font-mono space-y-1 text-[var(--muted)]">
              {kase.linkedIds.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--muted)]">No linked accounts/devices recorded.</p>
          )}
        </Card>
      </div>

      <Card className="p-5 mb-5">
        <h2 className="font-display font-semibold text-[15px] mb-3">Reasons</h2>
        <ul className="text-[13px] list-disc pl-5 space-y-1">
          {kase.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </Card>

      <Card className="p-5">
        <h2 className="font-display font-semibold text-[15px] mb-3">Admin Notes</h2>
        <div className="space-y-2 mb-4">
          {kase.notes.length === 0 && <p className="text-sm text-[var(--muted)]">No notes yet.</p>}
          {kase.notes.map((n) => (
            <div key={n.id} className="text-[13px] border-b border-[var(--line)] pb-2">
              <div className="text-[var(--muted)] text-[11px]">{n.author} · {dateShort(n.at)}</div>
              {n.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="Add a note…" value={note} onChange={(e) => setNote(e.target.value)} />
          <Button onClick={addNote}>Add note</Button>
        </div>
      </Card>
    </div>
  );
}
