"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr, dateShort } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, ErrorState } from "@/components/ui";

type RewardTransaction = {
  _id: string;
  userId: number;
  ruleName?: string;
  type: string;
  amount: number;
  status: string;
  source: string;
  createdAt: string;
};

export default function ReferralRewardsPage() {
  const [rows, setRows] = useState<RewardTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get<RewardTransaction[]>("/admin/rewards");
      setRows(res || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load rewards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (id: string, action: string) => {
    try {
      await api.patch(`/admin/referral-rewards/${id}/${action}`);
      setNotice(`Reward action "${action}" completed successfully.`);
      setTimeout(() => setNotice(null), 4000);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Action failed");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reward Ledger & Approvals"
        subtitle="Manage reward payouts, pending approval queues, and wallet credits."
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
          <div className="py-12 text-center text-sm text-[var(--muted)]">No reward transactions recorded yet.</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>User ID</Th>
                <Th>Rule / Description</Th>
                <Th>Type</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="hover:bg-black/5 transition-colors">
                  <Td className="font-mono font-semibold text-[var(--ink)]">User #{row.userId}</Td>
                  <Td className="text-sm text-[var(--ink)]">{row.ruleName || "Referral Conversion Reward"}</Td>
                  <Td className="uppercase font-mono text-xs text-[var(--muted)]">{row.type}</Td>
                  <Td className="font-mono font-bold text-[var(--teal)]">{inr(row.amount)}</Td>
                  <Td>
                    <StatusBadge
                      status={
                        row.status === "paid"
                          ? "Paid"
                          : row.status === "approved"
                          ? "Approved"
                          : row.status === "pending"
                          ? "Pending"
                          : "Rejected"
                      }
                    />
                  </Td>
                  <Td className="text-xs text-[var(--muted)] font-mono">{dateShort(row.createdAt)}</Td>
                  <Td className="text-right">
                    {row.status === "pending" ? (
                      <div className="flex justify-end gap-2 text-xs font-semibold">
                        <button
                          onClick={() => handleAction(row._id, "approve")}
                          className="text-[var(--teal)] hover:underline"
                        >
                          Approve & Pay
                        </button>
                        <button
                          onClick={() => handleAction(row._id, "reject")}
                          className="text-[var(--coral)] hover:underline"
                        >
                          Reject
                        </button>
                      </div>
                    ) : row.status === "paid" ? (
                      <button
                        onClick={() => handleAction(row._id, "reverse")}
                        className="text-xs font-semibold text-[var(--coral)] hover:underline"
                      >
                        Reverse
                      </button>
                    ) : (
                      <span className="text-xs text-[var(--muted)]">Completed</span>
                    )}
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
