"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr, num } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, ErrorState } from "@/components/ui";

type BrandPerformance = {
  _id: string;
  name: string;
  category: string;
  clicks: number;
  conversions: number;
  revenueGenerated: number;
  commissionEarned: number;
  status: string;
};

export default function BrandPerformancePage() {
  const [brands, setBrands] = useState<BrandPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get<BrandPerformance[]>("/brand-management/brands");
      setBrands([...(res || [])].sort((a, b) => (b.conversions || 0) - (a.conversions || 0)));
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load brand performance");
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
        title="Brand Performance Rankings"
        subtitle="Rankings of brand partners by customer conversion volume, click-through performance, and total revenue."
        action={
          <Button variant="secondary" onClick={loadData}>
            Refresh
          </Button>
        }
      />

      {error && <ErrorState message={error} />}

      <Card className="overflow-hidden">
        {loading && brands.length === 0 ? (
          <Loading />
        ) : brands.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">No performance data recorded yet.</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Rank</Th>
                <Th>Brand Partner</Th>
                <Th>Category</Th>
                <Th>Clicks</Th>
                <Th>Conversions</Th>
                <Th>Conversion Rate</Th>
                <Th>Revenue Generated</Th>
                <Th className="text-right">Commission Earned</Th>
              </tr>
            </thead>
            <tbody>
              {brands.map((b, idx) => {
                const cr = b.clicks ? ((b.conversions / b.clicks) * 100).toFixed(2) : "0.00";
                return (
                  <tr key={b._id} className="hover:bg-black/5 transition-colors">
                    <Td className="font-mono font-bold text-[var(--violet)]">#{idx + 1}</Td>
                    <Td className="font-semibold text-[var(--ink)]">{b.name}</Td>
                    <Td>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-black/5 text-[var(--muted)]">
                        {b.category}
                      </span>
                    </Td>
                    <Td className="font-mono text-[var(--muted)]">{num(b.clicks || 0)}</Td>
                    <Td className="font-mono font-bold text-[var(--teal)]">{num(b.conversions || 0)}</Td>
                    <Td className="font-mono text-[var(--ink)]">{cr}%</Td>
                    <Td className="font-mono font-semibold text-[var(--ink)]">{inr(b.revenueGenerated || 0)}</Td>
                    <Td className="font-mono font-bold text-right text-[var(--teal)]">{inr(b.commissionEarned || 0)}</Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
