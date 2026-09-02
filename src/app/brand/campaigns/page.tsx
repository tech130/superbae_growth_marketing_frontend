"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr, num, dateShort } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, ErrorState } from "@/components/ui";

type BrandCampaign = {
  _id: string;
  name: string;
  brandName?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  clicks?: number;
  conversions?: number;
  revenue?: number;
  status: string;
};

export default function BrandCampaignsPage() {
  const [campaigns, setCampaigns] = useState<BrandCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get<BrandCampaign[]>("/brand-management/campaigns");
      setCampaigns(res || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load brand campaigns");
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
        title="Brand Campaigns"
        subtitle="Active co-marketing promotions, merchant seasonal sales, and partner click attribution."
        action={
          <Button variant="secondary" onClick={loadData}>
            Refresh
          </Button>
        }
      />

      {error && <ErrorState message={error} />}

      <Card className="overflow-hidden">
        {loading && campaigns.length === 0 ? (
          <Loading />
        ) : campaigns.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">No brand campaigns launched yet.</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Campaign Name</Th>
                <Th>Brand Partner</Th>
                <Th>Category</Th>
                <Th>Clicks</Th>
                <Th>Conversions</Th>
                <Th>Revenue Generated</Th>
                <Th>Timeline</Th>
                <Th className="text-right">Status</Th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c._id} className="hover:bg-black/5 transition-colors">
                  <Td className="font-semibold text-[var(--ink)]">{c.name}</Td>
                  <Td className="text-[var(--ink)]">{c.brandName || "Acme Partner"}</Td>
                  <Td>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-black/5 text-[var(--muted)]">
                      {c.category || "General"}
                    </span>
                  </Td>
                  <Td className="font-mono text-[var(--muted)]">{num(c.clicks || 0)}</Td>
                  <Td className="font-mono font-bold text-[var(--teal)]">{num(c.conversions || 0)}</Td>
                  <Td className="font-mono text-[var(--ink)]">{inr(c.revenue || 0)}</Td>
                  <Td className="text-xs text-[var(--muted)] font-mono">
                    {c.startDate ? dateShort(c.startDate) : "—"} to {c.endDate ? dateShort(c.endDate) : "Ongoing"}
                  </Td>
                  <Td className="text-right">
                    <StatusBadge status={c.status === "active" ? "Active" : "Completed"} />
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
