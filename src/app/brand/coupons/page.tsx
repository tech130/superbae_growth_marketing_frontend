"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr, num, dateShort } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, ErrorState } from "@/components/ui";

type BrandCoupon = {
  _id: string;
  couponCode?: string;
  title: string;
  brandName?: string;
  category?: string;
  discountType: string;
  discountValue: number;
  redemptions?: number;
  validTill?: string;
  status: string;
};

export default function BrandCouponsPage() {
  const [coupons, setCoupons] = useState<BrandCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get<BrandCoupon[]>("/brand-management/offers");
      setCoupons((res || []).filter((o) => Boolean(o.couponCode)));
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load brand coupons");
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
        title="Brand Partner Coupons"
        subtitle="Exclusive checkout discount coupon codes redeemable on merchant partner websites."
        action={
          <Button variant="secondary" onClick={loadData}>
            Refresh
          </Button>
        }
      />

      {error && <ErrorState message={error} />}

      <Card className="overflow-hidden">
        {loading && coupons.length === 0 ? (
          <Loading />
        ) : coupons.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">No active partner coupons registered.</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Coupon Code</Th>
                <Th>Offer / Campaign</Th>
                <Th>Brand Partner</Th>
                <Th>Discount</Th>
                <Th>Total Redemptions</Th>
                <Th>Valid Until</Th>
                <Th className="text-right">Status</Th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id} className="hover:bg-black/5 transition-colors">
                  <Td className="font-mono font-bold text-[var(--violet)]">{c.couponCode}</Td>
                  <Td className="font-semibold text-[var(--ink)]">{c.title}</Td>
                  <Td className="text-[var(--muted)]">{c.brandName || "Merchant Partner"}</Td>
                  <Td className="font-mono font-bold text-[var(--teal)]">
                    {c.discountType === "percentage" ? `${c.discountValue}%` : inr(c.discountValue)}
                  </Td>
                  <Td className="font-mono text-[var(--muted)]">{num(c.redemptions || 0)}</Td>
                  <Td className="text-xs text-[var(--muted)] font-mono">{c.validTill ? dateShort(c.validTill) : "Ongoing"}</Td>
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
