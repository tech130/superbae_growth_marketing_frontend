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
  rejectionReason?: string;
  createdAt: string;
  status: string;
};

export default function RejectedReferralsPage() {
  const [rows, setRows] = useState<ReferralItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get<ReferralItem[]>("/admin/referrals?status=rejected");
      setRows(res || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load rejected referrals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRestore = async (id: string) => {
    try {
      await api.patch(`/admin/referrals/${id}/restore`);
      setNotice("Referral restored to pending state.");
      setTimeout(() => setNotice(null), 4000);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to restore referral");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rejected Referrals"
        subtitle="Disqualified or expired referral instances with reason breakdowns and restoration actions."
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
          <div className="py-12 text-center text-sm text-[var(--muted)]">No rejected referrals found.</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Referrer Account</Th>
                <Th>Referred User</Th>
                <Th>Code Used</Th>
                <Th>Disqualification Reason</Th>
                <Th>Created Date</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="hover:bg-black/5 transition-colors">
                  <Td className="font-mono font-semibold text-[var(--ink)]">User #{row.referrerId}</Td>
                  <Td className="font-mono text-[var(--muted)]">User #{row.referredUserId}</Td>
                  <Td className="font-mono font-bold text-[var(--violet)]">{row.referralCodeUsed}</Td>
                  <Td className="text-sm text-[var(--coral)] capitalize font-medium">
                    {row.rejectionReason?.replace(/_/g, " ") || "Disqualified by rule"}
                  </Td>
                  <Td className="text-xs text-[var(--muted)] font-mono">{dateShort(row.createdAt)}</Td>
                  <Td className="text-right">
                    <button
                      onClick={() => handleRestore(row._id)}
                      className="text-xs font-semibold text-[var(--teal)] hover:underline"
                    >
                      Restore to Pending
                    </button>
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
