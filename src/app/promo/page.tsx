"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { inr, num, dateShort } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, ErrorState } from "@/components/ui";

type PromoCode = {
  _id: string;
  code: string;
  source: string;
  brandName?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  eligibility: string;
  expiryDate?: string;
  usageLimit?: number;
  perUserLimit: number;
  redemptionsCount: number;
  totalDiscountGiven: number;
  status: "active" | "expired" | "disabled";
};

export default function PromoListPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const loadCodes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (sourceFilter) params.append("source", sourceFilter);
      if (statusFilter) params.append("status", statusFilter);
      const qs = params.toString() ? `?${params.toString()}` : "";

      const res = await api.get<PromoCode[]>(`/promo-management/codes${qs}`);
      setCodes(res || []);
      setNotice(null);
    } catch (e: any) {
      setNotice(e.message || "Could not fetch promo codes");
    } finally {
      setLoading(false);
    }
  }, [search, sourceFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCodes();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadCodes]);

  const handleToggleStatus = async (code: PromoCode) => {
    const nextStatus = code.status === "active" ? "disabled" : "active";
    try {
      await api.patch(`/promo-management/codes/${code._id}/status`, { status: nextStatus });
      setNotice(`Code ${code.code} marked as ${nextStatus}.`);
      await loadCodes();
    } catch (e: any) {
      setNotice(e.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promo Code Master Directory"
        subtitle="Manage all discount codes across referral, affiliate, creator, campaign, and brand partner channels."
        action={
          <div className="flex gap-2">
            <Link
              href="/promo/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--violet)] text-white px-4 py-2 text-sm font-medium hover:bg-[#b03d82] transition-colors"
            >
              + Create Promo Code
            </Link>
            <Button variant="secondary" onClick={loadCodes}>
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
          placeholder="Search by promo code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input max-w-44"
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
        >
          <option value="">All Sources</option>
          <option value="campaign">Campaign</option>
          <option value="brand">Brand Partner</option>
          <option value="creator">Creator</option>
          <option value="affiliate">Affiliate</option>
          <option value="referral">Referral</option>
          <option value="manual">Manual</option>
        </select>
        <select
          className="input max-w-40"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      <Card className="overflow-hidden">
        {loading && codes.length === 0 ? (
          <Loading />
        ) : codes.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">
            No promo codes found matching criteria. Click &quot;+ Create Promo Code&quot; to add one.
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Promo Code</Th>
                <Th>Source</Th>
                <Th>Discount</Th>
                <Th>Eligibility</Th>
                <Th>Redemptions</Th>
                <Th>Total Discount Given</Th>
                <Th>Expiry Date</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c._id} className="hover:bg-black/5 transition-colors">
                  <Td className="font-mono font-bold text-[var(--violet)]">{c.code}</Td>
                  <Td>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-black/5 text-[var(--muted)] capitalize">
                      {c.source} {c.brandName ? `(${c.brandName})` : ""}
                    </span>
                  </Td>
                  <Td className="font-mono font-bold text-[var(--teal)]">
                    {c.discountType === "percentage" ? `${c.discountValue}%` : inr(c.discountValue)}
                  </Td>
                  <Td className="capitalize text-xs text-[var(--muted)]">{c.eligibility.replace(/_/g, " ")}</Td>
                  <Td className="font-mono text-[var(--muted)]">
                    {num(c.redemptionsCount || 0)} {c.usageLimit ? `/ ${num(c.usageLimit)}` : ""}
                  </Td>
                  <Td className="font-mono text-[var(--ink)]">{inr(c.totalDiscountGiven || 0)}</Td>
                  <Td className="text-xs text-[var(--muted)] font-mono">{c.expiryDate ? dateShort(c.expiryDate) : "Never"}</Td>
                  <Td>
                    <StatusBadge
                      status={c.status === "active" ? "Active" : c.status === "expired" ? "Expired" : "Disabled"}
                    />
                  </Td>
                  <Td className="text-right">
                    <button
                      onClick={() => handleToggleStatus(c)}
                      className={`text-xs font-semibold hover:underline ${
                        c.status === "active" ? "text-[var(--amber)]" : "text-[var(--teal)]"
                      }`}
                    >
                      {c.status === "active" ? "Disable" : "Enable"}
                    </button>
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
