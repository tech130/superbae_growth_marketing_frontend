"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr, num } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, KpiCard, Button, Loading, ErrorState } from "@/components/ui";

type BrandItem = {
  _id: string;
  name: string;
  category: string;
  conversions: number;
  revenueGenerated: number;
  commissionEarned: number;
  commissionPaid: number;
};

export default function BrandRevenuePage() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get<BrandItem[]>("/brand-management/brands");
      setBrands(res || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load brand revenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRevenue = brands.reduce((sum, b) => sum + (b.revenueGenerated || 0), 0);
  const totalCommission = brands.reduce((sum, b) => sum + (b.commissionEarned || 0), 0);
  const totalPaid = brands.reduce((sum, b) => sum + (b.commissionPaid || 0), 0);
  const totalPayable = totalCommission - totalPaid;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brand Revenue & Financials"
        subtitle="Gross merchandise value, merchant commission earnings, and settlement balance ledger."
        action={
          <Button variant="secondary" onClick={loadData}>
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard label="Gross Revenue Generated" value={inr(totalRevenue)} hint="From partner conversions" accent="teal" />
        <KpiCard label="Total Commission" value={inr(totalCommission)} hint="Accrued earnings" accent="violet" />
        <KpiCard label="Commission Paid" value={inr(totalPaid)} hint="Disbursed to date" accent="amber" />
        <KpiCard label="Outstanding Payable" value={inr(totalPayable)} hint="Pending settlement" accent="coral" />
      </div>

      {error && <ErrorState message={error} />}

      <Card className="overflow-hidden">
        {loading && brands.length === 0 ? (
          <Loading />
        ) : brands.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">No revenue data available.</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Brand Merchant</Th>
                <Th>Category</Th>
                <Th>Conversions</Th>
                <Th>Gross Revenue</Th>
                <Th>Commission Earned</Th>
                <Th>Commission Paid</Th>
                <Th className="text-right">Balance Payable</Th>
              </tr>
            </thead>
            <tbody>
              {brands.map((b) => {
                const payable = (b.commissionEarned || 0) - (b.commissionPaid || 0);
                return (
                  <tr key={b._id} className="hover:bg-black/5 transition-colors">
                    <Td className="font-semibold text-[var(--ink)]">{b.name}</Td>
                    <Td>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-black/5 text-[var(--muted)]">
                        {b.category}
                      </span>
                    </Td>
                    <Td className="font-mono text-[var(--muted)]">{num(b.conversions || 0)}</Td>
                    <Td className="font-mono font-semibold text-[var(--ink)]">{inr(b.revenueGenerated || 0)}</Td>
                    <Td className="font-mono text-[var(--violet)]">{inr(b.commissionEarned || 0)}</Td>
                    <Td className="font-mono text-[var(--teal)]">{inr(b.commissionPaid || 0)}</Td>
                    <Td className="font-mono font-bold text-right text-[var(--coral)]">{inr(payable)}</Td>
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
