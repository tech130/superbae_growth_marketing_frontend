"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr, num, dateShort } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, ErrorState } from "@/components/ui";

type PromoCode = {
  _id: string;
  code: string;
  source: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  redemptionsCount: number;
  totalDiscountGiven: number;
  expiryDate?: string;
  status: string;
};

export default function ExpiredPromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get<PromoCode[]>("/promo-management/codes?status=expired");
      setCodes(res || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load expired promo codes");
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
        title="Expired Promo Codes"
        subtitle="Archived discount codes past their expiration threshold or max redemptions limit."
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
          <div className="py-12 text-center text-sm text-[var(--muted)]">No expired promo codes found.</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Promo Code</Th>
                <Th>Source</Th>
                <Th>Discount</Th>
                <Th>Total Redemptions</Th>
                <Th>Discounts Given</Th>
                <Th>Expired On</Th>
                <Th className="text-right">Status</Th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c._id} className="hover:bg-black/5 transition-colors">
                  <Td className="font-mono font-bold text-[var(--violet)]">{c.code}</Td>
                  <Td className="capitalize text-xs text-[var(--muted)]">{c.source}</Td>
                  <Td className="font-mono text-[var(--muted)]">
                    {c.discountType === "percentage" ? `${c.discountValue}%` : inr(c.discountValue)}
                  </Td>
                  <Td className="font-mono text-[var(--muted)]">{num(c.redemptionsCount || 0)}</Td>
                  <Td className="font-mono text-[var(--ink)]">{inr(c.totalDiscountGiven || 0)}</Td>
                  <Td className="text-xs text-[var(--muted)] font-mono">{c.expiryDate ? dateShort(c.expiryDate) : "Cap reached"}</Td>
                  <Td className="text-right">
                    <StatusBadge status="Expired" />
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
