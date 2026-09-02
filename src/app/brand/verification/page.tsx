"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { dateShort } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, ErrorState } from "@/components/ui";

type BrandItem = {
  _id: string;
  name: string;
  category: string;
  email: string;
  contactPerson?: string;
  phone?: string;
  website?: string;
  status: string;
  createdAt: string;
};

export default function BrandVerificationPage() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get<BrandItem[]>("/brand-management/brands?status=pending");
      setBrands(res || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load pending brand verifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = async (id: string, status: "active" | "rejected") => {
    try {
      await api.patch(`/brand-management/brands/${id}/status`, { status });
      setNotice(`Brand ${status === "active" ? "approved & verified" : "rejected"}.`);
      setTimeout(() => setNotice(null), 4000);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Action failed");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brand Verification Queue"
        subtitle="Review onboarding merchant applications, KYC verification, and partnership approvals."
        action={
          <Button variant="secondary" onClick={loadData}>
            Refresh
          </Button>
        }
      />

      {notice && (
        <div className="p-4 rounded-xl text-sm font-medium bg-[var(--teal-dim)] text-[var(--teal)] border border-[var(--teal)]">
          {notice}
        </div>
      )}

      {error && <ErrorState message={error} />}

      <Card className="overflow-hidden">
        {loading && brands.length === 0 ? (
          <Loading />
        ) : brands.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">
            No brand partner applications currently waiting in verification queue.
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Brand Name</Th>
                <Th>Category</Th>
                <Th>Contact Information</Th>
                <Th>Applied On</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {brands.map((b) => (
                <tr key={b._id} className="hover:bg-black/5 transition-colors">
                  <Td>
                    <p className="font-bold text-[var(--ink)]">{b.name}</p>
                    {b.website && (
                      <a
                        href={b.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[var(--muted)] hover:text-[var(--violet)]"
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
                  <Td className="text-xs text-[var(--muted)] font-mono">{dateShort(b.createdAt)}</Td>
                  <Td>
                    <StatusBadge status="Pending" />
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-3 text-xs font-semibold">
                      <button
                        onClick={() => handleVerify(b._id, "active")}
                        className="text-[var(--teal)] hover:underline"
                      >
                        Approve Partner
                      </button>
                      <button
                        onClick={() => handleVerify(b._id, "rejected")}
                        className="text-[var(--coral)] hover:underline"
                      >
                        Reject
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
