"use client";

import Link from "next/link";
import api from "@/lib/api";
import { FraudCase } from "@/lib/types";
import { dateShort } from "@/lib/format";
import { Table, Th, Td, StatusBadge, Button, Loading, EmptyState } from "@/components/ui";

/**
 * Shared row renderer for every Fraud Detection signal screen (Duplicate
 * Devices/Accounts, Suspicious IPs, Self-Referrals, Abnormal Conversion,
 * Reward Abuse, Affiliate Abuse, and the master Suspicious Referrals queue)
 * — same FraudCase shape, same actions, different `fraudType` filter.
 */
export function FraudCaseTable({ rows, onChange }: { rows: FraudCase[] | null; onChange: () => void }) {
  if (!rows) return <Loading />;
  if (rows.length === 0) return <EmptyState title="Nothing flagged" subtitle="No cases have tripped this heuristic yet." />;

  return (
    <Table>
      <thead>
        <tr>
          <Th>Subject</Th>
          <Th>Source</Th>
          <Th>Risk</Th>
          <Th>Reasons</Th>
          <Th>Flagged</Th>
          <Th>Status</Th>
          <Th>Actions</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((c) => (
          <tr key={c.id}>
            <Td className="font-medium">
              <Link href={`/fraud-detection/cases/${c.id}`} className="hover:underline">
                {c.subjectLabel}
              </Link>
              {c.relatedSubjectLabel && <div className="text-[11px] text-[var(--muted)]">→ {c.relatedSubjectLabel}</div>}
            </Td>
            <Td>{c.sourceType}</Td>
            <Td>
              <div className="flex items-center gap-2">
                <StatusBadge status={c.riskLevel} />
                <span className="font-mono text-xs">{c.riskScore}/100</span>
              </div>
            </Td>
            <Td className="text-[12.5px] text-[var(--muted)] max-w-xs">{c.reasons.join("; ")}</Td>
            <Td>{dateShort(c.createdAt)}</Td>
            <Td>
              <StatusBadge status={c.status} />
            </Td>
            <Td>
              {(c.status === "Flagged" || c.status === "Investigating" || c.status === "On Hold") && (
                <div className="flex gap-2 flex-wrap">
                  {c.status === "Flagged" && (
                    <Button variant="secondary" onClick={() => api.post(`/fraud-detection/${c.id}/investigate`).then(onChange)}>
                      Investigate
                    </Button>
                  )}
                  <Button variant="secondary" onClick={() => api.post(`/fraud-detection/${c.id}/hold`).then(onChange)}>
                    Hold
                  </Button>
                  <Button onClick={() => api.post(`/fraud-detection/${c.id}/legitimate`).then(onChange)}>Mark legitimate</Button>
                  <Button variant="danger" onClick={() => api.post(`/fraud-detection/${c.id}/confirm-fraud`).then(onChange)}>
                    Confirm fraud
                  </Button>
                </div>
              )}
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
