"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr, num, dateShort } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, ErrorState } from "@/components/ui";

type PromoCode = {
  _id: string;
  code: string;
  discountType: string;
  discountValue: number;
  redemptionsCount: number;
  totalDiscountGiven: number;
  expiryDate?: string;
  status: string;
};

export default function AffiliatePromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get<PromoCode[]>("/promo-management/codes?source=affiliate");
      setCodes(res || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load affiliate promo codes");
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
        title="Affiliate Partner Promo Codes"
        subtitle="Custom voucher codes assigned to affiliate networks and publishers."
        action={
          <Button variant="secondary" onClick={loadData}>
            Refresh
          </Button>
        }
      />

      {error && <ErrorState message={error} />}

      <Card className="overflow-hidden">
        {loading && codes.length === 0 ? (
          <Loading />
        ) : codes.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">No affiliate promo codes registered yet.</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Affiliate Code</Th>
                <Th>Discount</Th>
                <Th>Redemptions</Th>
                <Th>Total Discount Given</Th>
                <Th>Expiry Date</Th>
                <Th className="text-right">Status</Th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c._id} className="hover:bg-black/5 transition-colors">
                  <Td className="font-mono font-bold text-[var(--violet)]">{c.code}</Td>
                  <Td className="font-mono font-bold text-[var(--teal)]">
                    {c.discountType === "percentage" ? `${c.discountValue}%` : inr(c.discountValue)}
                  </Td>
                  <Td className="font-mono text-[var(--muted)]">{num(c.redemptionsCount || 0)}</Td>
                  <Td className="font-mono text-[var(--ink)]">{inr(c.totalDiscountGiven || 0)}</Td>
                  <Td className="text-xs text-[var(--muted)] font-mono">{c.expiryDate ? dateShort(c.expiryDate) : "Never"}</Td>
                  <Td className="text-right">
                    <StatusBadge status={c.status === "active" ? "Active" : "Expired"} />
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
