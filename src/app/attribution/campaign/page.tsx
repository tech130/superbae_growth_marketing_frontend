"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr, num } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, Loading, EmptyState, ErrorState } from "@/components/ui";

interface Row {
  name: string;
  attributedConversions: number;
  revenue: number;
  model: string;
  shareOfUser: number;
}

export default function CampaignAttributionPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Row[]>("/attribution/campaign").then(setRows).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader title="Campaign Attribution" subtitle="How much credit each named campaign earns across all the sources it wraps — reported on the same attribution basis as every other view." />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No campaign-credited conversions yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Campaign / Channel</Th>
                <Th>Attributed Conversions</Th>
                <Th>Revenue</Th>
                <Th>Model</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name}>
                  <Td className="font-medium">{r.name}</Td>
                  <Td className="font-mono">{num(r.attributedConversions)}</Td>
                  <Td className="font-mono">{inr(r.revenue)}</Td>
                  <Td className="capitalize">{r.model.replace("-", " ")}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
