"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { inr, num } from "@/lib/format";
import { PageHeader, KpiCard, Card, Table, Th, Td, StatusBadge, Button, Loading, ErrorState } from "@/components/ui";

type BrandDashboardData = {
  totalBrands: number;
  activeBrands: number;
  pendingVerification: number;
  totalOffersLive: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommissionPayable: number;
  totalCommissionPaid: number;
  categoryStats: Record<string, { count: number; conversions: number; revenue: number }>;
  topBrands: Array<{
    _id: string;
    name: string;
    category: string;
    conversions: number;
    revenueGenerated: number;
    commissionEarned: number;
    status: string;
  }>;
};

const categories = [
  "Fashion",
  "Beauty",
  "Wellness",
  "Travel",
  "Fitness",
  "Lifestyle",
  "Restaurants",
  "Experiences",
];

export default function BrandDashboardPage() {
  const [data, setData] = useState<BrandDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get<BrandDashboardData>("/brand-management/dashboard");
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load brand dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brand Partner Dashboard"
        subtitle="Cross-category brand deals, acquisition promotions, and partner commission settlement."
        action={
          <div className="flex gap-2">
            <Link
              href="/brand/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--violet)] text-white px-4 py-2 text-sm font-medium hover:bg-[#b03d82] transition-colors"
            >
              + Onboard Brand
            </Link>
            <Button variant="secondary" onClick={loadData}>
              Refresh
            </Button>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Brand Partners"
          value={num(data?.totalBrands || 0)}
          hint={`${data?.activeBrands || 0} active · ${data?.pendingVerification || 0} pending`}
          accent="violet"
        />
        <KpiCard
          label="Live Offers & Deals"
          value={num(data?.totalOffersLive || 0)}
          hint="Across 8 categories"
          accent="teal"
        />
        <KpiCard
          label="Revenue Generated"
          value={inr(data?.totalRevenue || 0)}
          hint={`${num(data?.totalConversions || 0)} conversions`}
          accent="amber"
        />
        <KpiCard
          label="Commission Payable"
          value={inr(data?.totalCommissionPayable || 0)}
          hint={`Paid: ${inr(data?.totalCommissionPaid || 0)}`}
          accent="coral"
        />
      </div>

      {/* Category Breakdown */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display font-bold text-lg text-[var(--ink)]">Partner Categories</div>
            <p className="text-xs text-[var(--muted)]">Active brand partner volume and revenue by consumer vertical</p>
          </div>
          <Link href="/brand" className="text-xs font-semibold text-[var(--violet)] hover:underline">
            View All Brands →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {categories.map((cat) => {
            const stat = data?.categoryStats?.[cat] || { count: 0, conversions: 0, revenue: 0 };
            return (
              <div
                key={cat}
                className="p-4 rounded-xl border border-[var(--line)] bg-[var(--paper)] hover:border-[var(--violet)] transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[var(--ink)]">{cat}</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-black/5 text-[var(--muted)]">
                    {stat.count} brands
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--muted)] pt-1">
                  <span>Conversions: <strong className="text-[var(--ink)]">{num(stat.conversions)}</strong></span>
                  <span className="font-mono">{inr(stat.revenue)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Top Brands Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
          <div>
            <div className="font-display font-bold text-base text-[var(--ink)]">Top Performing Brands</div>
            <p className="text-xs text-[var(--muted)]">Ranked by volume of confirmed customer conversions</p>
          </div>
          <Link href="/brand/performance" className="text-xs font-semibold text-[var(--violet)] hover:underline">
            Full Rankings →
          </Link>
        </div>

        {data?.topBrands?.length === 0 ? (
          <div className="py-8 text-center text-sm text-[var(--muted)]">No brand data available.</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Brand Partner</Th>
                <Th>Category</Th>
                <Th>Conversions</Th>
                <Th>Revenue Generated</Th>
                <Th>Commission Earned</Th>
                <Th className="text-right">Status</Th>
              </tr>
            </thead>
            <tbody>
              {data?.topBrands?.map((brand) => (
                <tr key={brand._id} className="hover:bg-black/5 transition-colors">
                  <Td className="font-semibold text-[var(--ink)]">{brand.name}</Td>
                  <Td>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-black/5 text-[var(--muted)]">
                      {brand.category}
                    </span>
                  </Td>
                  <Td className="font-mono font-bold text-[var(--teal)]">{num(brand.conversions || 0)}</Td>
                  <Td className="font-mono text-[var(--ink)]">{inr(brand.revenueGenerated || 0)}</Td>
                  <Td className="font-mono text-[var(--violet)]">{inr(brand.commissionEarned || 0)}</Td>
                  <Td className="text-right">
                    <StatusBadge status={brand.status === "active" ? "Active" : "Pending"} />
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
