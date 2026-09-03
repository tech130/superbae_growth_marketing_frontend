"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr, num } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, Loading, ErrorState } from "@/components/ui";

interface Row {
  source: string;
  clicks: number;
  installs: number;
  conversions: number;
  revenue: number;
  share: number;
}

export default function SourceAnalyticsPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Row[]>("/attribution/source-analytics").then(setRows).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader title="Source Analytics" subtitle="Every acquisition source side by side on the same funnel and attribution basis — which channel is genuinely most efficient." />
      <Card>
        {!rows ? (
          <Loading />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Source</Th>
                <Th>Clicks</Th>
                <Th>Installs</Th>
                <Th>Conversions</Th>
                <Th>Revenue</Th>
                <Th>Share</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.source}>
                  <Td className="font-medium">{r.source}</Td>
                  <Td className="font-mono">{num(r.clicks)}</Td>
                  <Td className="font-mono">{num(r.installs)}</Td>
                  <Td className="font-mono">{num(r.conversions)}</Td>
                  <Td className="font-mono">{inr(r.revenue)}</Td>
                  <Td className="font-mono">{r.share}%</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
