"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr, dateShort } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, Button, Loading, ErrorState } from "@/components/ui";

type Redemption = {
  _id: string;
  code: string;
  user: string;
  orderPlan: string;
  source: string;
  discountApplied: number;
  orderAmount: number;
  createdAt: string;
};

export default function PromoUsageHistoryPage() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get<Redemption[]>("/promo-management/redemptions");
      setRedemptions(res || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load usage history");
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
        title="Promo Usage & Redemption History"
        subtitle="Live audit trail of customer coupon redemptions during checkout transactions."
        action={
          <Button variant="secondary" onClick={loadData}>
            Refresh
          </Button>
        }
      />

      {error && <ErrorState message={error} />}

      <Card className="overflow-hidden">
        {loading && redemptions.length === 0 ? (
          <Loading />
        ) : redemptions.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">No coupon redemptions recorded yet.</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Promo Code</Th>
                <Th>Customer User</Th>
                <Th>Plan Purchased</Th>
                <Th>Acquisition Source</Th>
                <Th>Discount Applied</Th>
                <Th>Order Total</Th>
                <Th className="text-right">Redemption Date</Th>
              </tr>
            </thead>
            <tbody>
              {redemptions.map((r) => (
                <tr key={r._id} className="hover:bg-black/5 transition-colors">
                  <Td className="font-mono font-bold text-[var(--violet)]">{r.code}</Td>
                  <Td className="font-semibold text-[var(--ink)]">{r.user || "Customer"}</Td>
                  <Td className="text-sm text-[var(--ink)]">{r.orderPlan || "Standard Pro"}</Td>
                  <Td className="capitalize text-xs text-[var(--muted)]">{r.source || "Campaign"}</Td>
                  <Td className="font-mono font-bold text-[var(--teal)]">{inr(r.discountApplied)}</Td>
                  <Td className="font-mono text-[var(--muted)]">{inr(r.orderAmount || 1000)}</Td>
                  <Td className="text-right text-xs text-[var(--muted)] font-mono">{dateShort(r.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
