"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr, num, dateShort } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, ErrorState } from "@/components/ui";

type BrandOffer = {
  _id: string;
  title: string;
  brandName?: string;
  category?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  couponCode?: string;
  validTill?: string;
  redemptions?: number;
  status: string;
};

export default function BrandOffersPage() {
  const [offers, setOffers] = useState<BrandOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get<BrandOffer[]>("/brand-management/offers");
      setOffers(res || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load brand offers");
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
        title="Brand Offers & Deals"
        subtitle="Exclusive customer perks, redemption limits, and member discount configurations."
        action={
          <Button variant="secondary" onClick={loadData}>
            Refresh
          </Button>
        }
      />

      {error && <ErrorState message={error} />}

      <Card className="overflow-hidden">
        {loading && offers.length === 0 ? (
          <Loading />
        ) : offers.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">No brand offers live right now.</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Offer Title</Th>
                <Th>Brand</Th>
                <Th>Category</Th>
                <Th>Discount Value</Th>
                <Th>Coupon Code</Th>
                <Th>Total Redemptions</Th>
                <Th>Expiry Date</Th>
                <Th className="text-right">Status</Th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o._id} className="hover:bg-black/5 transition-colors">
                  <Td className="font-semibold text-[var(--ink)]">{o.title}</Td>
                  <Td className="text-[var(--ink)]">{o.brandName || "Partner"}</Td>
                  <Td>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-black/5 text-[var(--muted)]">
                      {o.category || "General"}
                    </span>
                  </Td>
                  <Td className="font-mono font-bold text-[var(--teal)]">
                    {o.discountType === "percentage" ? `${o.discountValue}% OFF` : inr(o.discountValue)}
                  </Td>
                  <Td className="font-mono font-bold text-[var(--violet)]">{o.couponCode || "—"}</Td>
                  <Td className="font-mono text-[var(--muted)]">{num(o.redemptions || 0)}</Td>
                  <Td className="text-xs text-[var(--muted)] font-mono">{o.validTill ? dateShort(o.validTill) : "No expiry"}</Td>
                  <Td className="text-right">
                    <StatusBadge status={o.status === "active" ? "Active" : "Completed"} />
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
