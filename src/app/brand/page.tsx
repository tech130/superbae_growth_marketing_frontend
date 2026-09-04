"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { inr, num } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, ErrorState } from "@/components/ui";

type BrandItem = {
  _id: string;
  name: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  commissionArrangement: string;
  commissionValue: number;
  offersCount: number;
  clicks: number;
  conversions: number;
  revenueGenerated: number;
  commissionEarned: number;
  status: "pending" | "active" | "suspended" | "rejected";
  createdAt: string;
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

export default function BrandListPage() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const loadBrands = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (categoryFilter) params.append("category", categoryFilter);
      if (statusFilter) params.append("status", statusFilter);
      const qs = params.toString() ? `?${params.toString()}` : "";

      const res = await api.get<BrandItem[]>(`/brand-management/brands${qs}`);
      setBrands(res || []);
      setNotice(null);
    } catch (e: any) {
      setNotice(e.message || "Could not fetch brands");
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBrands();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadBrands]);

  const handleToggleStatus = async (brand: BrandItem) => {
    const nextStatus = brand.status === "active" ? "suspended" : "active";
    try {
      await api.patch(`/brand-management/brands/${brand._id}/status`, { status: nextStatus });
      setNotice(`Brand ${brand.name} status updated to ${nextStatus}.`);
      await loadBrands();
    } catch (e: any) {
      setNotice(e.message || "Status update failed");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brand Partner Master List"
        subtitle="Manage all verified and registered brand partnerships, active deals, and conversions."
        action={
          <div className="flex gap-2">
            <Link
              href="/brand/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--violet)] text-white px-4 py-2 text-sm font-medium hover:bg-[#b03d82] transition-colors"
            >
              + Add New Brand
            </Link>
            <Button variant="secondary" onClick={loadBrands}>
              Refresh
            </Button>
          </div>
        }
      />

      {notice && (
        <div className="p-4 rounded-xl text-sm font-medium bg-[var(--teal-dim)] text-[var(--teal)] border border-[var(--teal)]">
          {notice}
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="input max-w-xs"
          placeholder="Search by brand name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input max-w-44"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="input max-w-40"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <Card className="overflow-hidden">
        {loading && brands.length === 0 ? (
          <Loading />
        ) : brands.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">
            No brand partners found matching criteria. Click &quot;+ Add New Brand&quot; to onboard.
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Brand Partner</Th>
                <Th>Category</Th>
                <Th>Contact Person</Th>
                <Th>Live Offers</Th>
                <Th>Clicks</Th>
                <Th>Conversions</Th>
                <Th>Commission</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {brands.map((b) => (
                <tr key={b._id} className="hover:bg-black/5 transition-colors">
                  <Td>
                    <Link
                      href={`/brand/${b._id}`}
                      className="font-bold text-[var(--ink)] hover:text-[var(--violet)] transition-colors hover:underline"
                    >
                      {b.name}
                    </Link>
                    {b.website && (
                      <a
                        href={b.website}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-xs text-[var(--muted)] hover:text-[var(--violet)]"
                      >
                        {b.website.replace("https://", "")}
                      </a>
                    )}
                  </Td>
                  <Td>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-black/5 text-[var(--muted)]">
                      {b.category}
                    </span>
                  </Td>
                  <Td>
                    <p className="text-xs font-semibold text-[var(--ink)]">{b.contactPerson || "—"}</p>
                    <p className="text-xs text-[var(--muted)]">{b.email}</p>
                  </Td>
                  <Td className="font-mono text-[var(--muted)]">{b.offersCount || 0} offers</Td>
                  <Td className="font-mono font-semibold text-[var(--ink)]">{num(b.clicks || 0)}</Td>
                  <Td className="font-mono font-bold text-[var(--teal)]">{num(b.conversions || 0)}</Td>
                  <Td className="font-mono text-[var(--ink)]">{inr(b.commissionEarned || 0)}</Td>
                  <Td>
                    <StatusBadge
                      status={
                        b.status === "active"
                          ? "Active"
                          : b.status === "pending"
                          ? "Pending"
                          : "Suspended"
                      }
                    />
                  </Td>
                  <Td className="text-right">
                    <div className="inline-flex items-center gap-2 justify-end">
                      <Link
                        href={`/brand/${b._id}`}
                        className="rounded bg-[var(--paper)] border border-[var(--line)] px-2.5 py-1 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--violet-dim)] hover:border-[var(--violet)] transition-colors"
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(b)}
                        className={`text-xs font-semibold hover:underline ${
                          b.status === "active" ? "text-[var(--amber)]" : "text-[var(--teal)]"
                        }`}
                      >
                        {b.status === "active" ? "Suspend" : "Activate"}
                      </button>
                    </div>
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
