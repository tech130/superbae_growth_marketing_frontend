"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { dateShort } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, ErrorState } from "@/components/ui";

type ReferralItem = {
  _id: string;
  referrerId: number;
  referredUserId: number;
  referralCodeUsed: string;
  currentStage?: string;
  daysPending?: number;
  signedUpAt: string;
  verifiedAt?: string;
  status: string;
};

export default function PendingReferralsPage() {
  const [rows, setRows] = useState<ReferralItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get<ReferralItem[]>("/admin/referrals?status=pending");
      setRows(res || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load pending referrals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (url: string, method = "PATCH", body?: unknown) => {
    try {
      await api.patch(url, body);
      setNotice("Referral updated successfully.");
      setTimeout(() => setNotice(null), 4000);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Action failed");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Referrals"
        subtitle="Newly registered referrals awaiting user verification or first subscription conversion."
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
          <div className="py-12 text-center text-sm text-[var(--muted)]">No pending referrals right now.</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Referrer User</Th>
                <Th>Referred User</Th>
                <Th>Code Used</Th>
                <Th>Current Stage</Th>
                <Th>Days Pending</Th>
                <Th>Registered On</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="hover:bg-black/5 transition-colors">
                  <Td className="font-mono font-semibold text-[var(--ink)]">User #{row.referrerId}</Td>
                  <Td className="font-mono text-[var(--muted)]">User #{row.referredUserId}</Td>
                  <Td className="font-mono font-bold text-[var(--violet)]">{row.referralCodeUsed}</Td>
                  <Td>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-[var(--amber-dim)] text-[var(--amber)]">
                      {row.currentStage === "subscription" ? "Waiting for subscription" : "Waiting for verification"}
                    </span>
                  </Td>
                  <Td className="font-mono text-[var(--ink)]">{row.daysPending ?? 0} days</Td>
                  <Td className="text-xs text-[var(--muted)] font-mono">{dateShort(row.signedUpAt)}</Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-3 text-xs font-semibold">
                      <button
                        onClick={() => handleAction(`/admin/referrals/${row._id}/reject`, "PATCH", { reason: "admin_disqualified" })}
                        className="text-[var(--coral)] hover:underline"
                      >
                        Reject
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
