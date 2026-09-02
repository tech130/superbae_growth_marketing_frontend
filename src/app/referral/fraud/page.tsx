"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { dateShort } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, ErrorState } from "@/components/ui";

type FraudItem = {
  _id: string;
  referral: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  reasons: string[];
  status: string;
  createdAt: string;
};

export default function ReferralFraudPage() {
  const [rows, setRows] = useState<FraudItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get<FraudItem[]>("/admin/fraud");
      setRows(res || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load fraud flags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (id: string, action: string) => {
    try {
      await api.patch(`/admin/fraud/${id}/${action}`);
      setNotice(`Flag marked as "${action}".`);
      setTimeout(() => setNotice(null), 4000);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Action failed");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referral Fraud Detection"
        subtitle="Automated anti-abuse anomaly detection, velocity checks, and risk adjudication."
        action={
          <Button variant="secondary" onClick={loadData}>
            Refresh
          </Button>
        }
      />

      {notice && (
        <div className="p-4 rounded-xl text-sm font-medium bg-[var(--teal-dim)] text-[var(--teal)] border border-[var(--teal)]">
          {notice}
        </div>
      )}

      {error && <ErrorState message={error} />}

      <Card className="overflow-hidden">
        {loading && rows.length === 0 ? (
          <Loading />
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">No suspicious referral activities detected.</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Referral ID</Th>
                <Th>Risk Score</Th>
                <Th>Risk Level</Th>
                <Th>Reasons Triggered</Th>
                <Th>Status</Th>
                <Th className="text-right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="hover:bg-black/5 transition-colors">
                  <Td className="font-mono text-xs text-[var(--muted)]">{row.referral}</Td>
                  <Td className="font-mono font-bold text-[var(--ink)]">{row.riskScore}/100</Td>
                  <Td>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        row.riskLevel === "high"
                          ? "bg-[var(--coral-dim)] text-[var(--coral)]"
                          : row.riskLevel === "medium"
                          ? "bg-[var(--amber-dim)] text-[var(--amber)]"
                          : "bg-[var(--teal-dim)] text-[var(--teal)]"
                      }`}
                    >
                      {row.riskLevel.toUpperCase()}
                    </span>
                  </Td>
                  <Td className="text-xs text-[var(--ink)]">
                    {Array.isArray(row.reasons) ? row.reasons.join(", ") : "—"}
                  </Td>
                  <Td className="capitalize text-xs font-semibold text-[var(--muted)]">{row.status}</Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-3 text-xs font-semibold">
                      <button
                        onClick={() => handleAction(row._id, "approve")}
                        className="text-[var(--teal)] hover:underline"
                      >
                        Mark Legitimate
                      </button>
                      <button
                        onClick={() => handleAction(row._id, "reject")}
                        className="text-[var(--coral)] hover:underline"
                      >
                        Disqualify
                      </button>
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
