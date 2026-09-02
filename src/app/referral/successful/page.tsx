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
  convertedAt?: string;
  subscriptionType?: string;
  status: string;
};

export default function SuccessfulReferralsPage() {
  const [rows, setRows] = useState<ReferralItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get<ReferralItem[]>("/admin/referrals?status=successful");
      setRows(res || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load successful referrals");
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
        title="Successful Conversions"
        subtitle="Referral instances that completed subscription conversions and triggered incentive rewards."
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
          <div className="py-12 text-center text-sm text-[var(--muted)]">No successful conversions recorded yet.</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Referrer Account</Th>
                <Th>Subscribed User</Th>
                <Th>Code Used</Th>
                <Th>Plan Subscribed</Th>
                <Th>Converted Date</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="hover:bg-black/5 transition-colors">
                  <Td className="font-mono font-semibold text-[var(--ink)]">User #{row.referrerId}</Td>
                  <Td className="font-mono text-[var(--muted)]">User #{row.referredUserId}</Td>
                  <Td className="font-mono font-bold text-[var(--violet)]">{row.referralCodeUsed}</Td>
                  <Td className="capitalize text-[var(--ink)]">{row.subscriptionType || "Standard Pro"}</Td>
                  <Td className="text-xs text-[var(--muted)] font-mono">
                    {row.convertedAt ? dateShort(row.convertedAt) : "—"}
                  </Td>
                  <Td>
                    <StatusBadge status="Converted" />
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
