"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Affiliate } from "@/lib/types";
import { num, dateShort } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

const CHECKS: { key: keyof NonNullable<Affiliate["verification"]>; label: string }[] = [
  { key: "identityVerified", label: "Identity / email / phone" },
  { key: "socialVerified", label: "Social account ownership" },
  { key: "followerAuthenticityChecked", label: "Follower authenticity (bot check)" },
  { key: "audienceRelevanceChecked", label: "Audience relevance to app categories" },
];

export default function CreatorVerificationPage() {
  const [rows, setRows] = useState<Affiliate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, Partial<NonNullable<Affiliate["verification"]>>>>({});

  function load() {
    api
      .get<Affiliate[]>("/creators/verification/queue")
      .then((r) => {
        setRows(r);
        setDraft(Object.fromEntries(r.map((a) => [a.id, a.verification || {}])));
      })
      .catch((e) => setError(e.message));
  }
  useEffect(load, []);

  function toggle(id: string, key: keyof NonNullable<Affiliate["verification"]>) {
    setDraft((d) => ({ ...d, [id]: { ...d[id], [key]: !d[id]?.[key] } }));
  }

  async function saveChecklist(id: string) {
    setBusy(id);
    try {
      await api.post(`/creators/${id}/verification`, draft[id]);
      load();
    } finally {
      setBusy(null);
    }
  }

  async function approve(id: string) {
    setBusy(id);
    try {
      await api.post(`/creators/${id}/approve`);
      load();
    } finally {
      setBusy(null);
    }
  }

  async function reject(id: string) {
    const reason = window.prompt("Reason for rejection?") || "Not specified";
    setBusy(id);
    try {
      await api.post(`/creators/${id}/reject`, { reason });
      load();
    } finally {
      setBusy(null);
    }
  }

  async function flagForReview(id: string) {
    setBusy(id);
    try {
      await api.post(`/creators/${id}/verification`, { ...draft[id], flaggedForReview: true });
      load();
    } finally {
      setBusy(null);
    }
  }

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Creator Verification"
        subtitle="Verify a creator's identity and social presence before activating their account — approving generates the referral code and tracking link."
      />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="Nothing pending" subtitle="Every creator application has been reviewed." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Creator</Th>
                <Th>Category</Th>
                <Th>Followers</Th>
                <Th>Submitted on</Th>
                <Th>Checklist</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const d = draft[a.id] || {};
                const allChecked = CHECKS.every((c) => d[c.key]);
                return (
                  <tr key={a.id}>
                    <Td className="font-medium">
                      <Link href={`/creators/${a.id}`} className="hover:text-[var(--violet)]">
                        {a.name}
                      </Link>
                    </Td>
                    <Td>{a.category}</Td>
                    <Td className="font-mono">{num(a.reach ?? 0)}</Td>
                    <Td>{dateShort(a.createdAt)}</Td>
                    <Td>
                      <div className="space-y-1">
                        {CHECKS.map((c) => (
                          <label key={c.key} className="flex items-center gap-1.5 text-[12px] text-[var(--muted)]">
                            <input type="checkbox" checked={!!d[c.key]} onChange={() => toggle(a.id, c.key)} />
                            {c.label}
                          </label>
                        ))}
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={busy === a.id}
                          onClick={() => saveChecklist(a.id)}
                        >
                          Save checklist
                        </Button>
                      </div>
                    </Td>
                    <Td>
                      <div className="flex flex-col gap-2 items-start">
                        <div className="flex gap-2">
                          <Button disabled={busy === a.id || !allChecked} onClick={() => approve(a.id)}>
                            Approve
                          </Button>
                          <Button variant="secondary" disabled={busy === a.id} onClick={() => reject(a.id)}>
                            Reject
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" disabled={busy === a.id} onClick={() => flagForReview(a.id)}>
                          {d.flaggedForReview ? "Flagged for manual review" : "Flag for manual review"}
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
