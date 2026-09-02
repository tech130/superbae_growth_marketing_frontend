"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { dateShort } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, ErrorState } from "@/components/ui";

type HistoryItem = {
  _id: string;
  referral: string;
  action: string;
  performedBy: string;
  status: string;
  metadata?: Record<string, any>;
  createdAt: string;
};

export default function ReferralHistoryPage() {
  const [rows, setRows] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get<HistoryItem[]>("/admin/referral-history");
      setRows(res || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load history audit");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referral Audit History"
        subtitle="Chronological audit event trail tracking all state transitions, system triggers, and admin overrides."
        action={
          <Button variant="secondary" onClick={loadData}>
            Refresh
          </Button>
        }
      />

      {error && <ErrorState message={error} />}

      <Card className="overflow-hidden">
        {loading && rows.length === 0 ? (
          <Loading />
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">No referral history events logged yet.</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Referral ID</Th>
                <Th>Action Event</Th>
                <Th>Performed By</Th>
                <Th>Status</Th>
                <Th>Metadata</Th>
                <Th className="text-right">Timestamp</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="hover:bg-black/5 transition-colors">
                  <Td className="font-mono text-xs text-[var(--muted)]">{row.referral}</Td>
                  <Td className="font-semibold text-sm capitalize text-[var(--ink)]">
                    {row.action.replace(/_/g, " ")}
                  </Td>
                  <Td className="text-xs text-[var(--muted)] uppercase font-mono">{row.performedBy}</Td>
                  <Td>
                    <StatusBadge status={row.status === "success" ? "Valid" : "Failed"} />
                  </Td>
                  <Td className="font-mono text-xs text-[var(--muted)] max-w-xs truncate">
                    {row.metadata ? JSON.stringify(row.metadata) : "—"}
                  </Td>
                  <Td className="text-right text-xs text-[var(--muted)] font-mono">{dateShort(row.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
