"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, Loading, ErrorState } from "@/components/ui";
import { BarChart } from "@/components/Charts";

interface Row {
  source: string;
  attributedRevenue: number;
  cost: number;
  net: number;
  roi: number;
}

export default function RevenueAttributionPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Row[]>("/attribution/revenue").then(setRows).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader title="Revenue Attribution" subtitle="Ties attributed conversions to actual revenue and cost, so finance can see the real return of each source after commission and rewards." />
      {!rows ? (
        <Loading />
      ) : (
        <>
          <Card className="p-5 mb-5">
            <h2 className="font-display font-semibold text-[15px] mb-3">Net Revenue After Payout, by Source</h2>
            <BarChart data={rows.map((r) => ({ label: r.source, value: r.net }))} formatValue={inr} color="var(--teal)" />
          </Card>
          <Card>
            <Table>
              <thead>
                <tr>
                  <Th>Source</Th>
                  <Th>Attributed Revenue</Th>
                  <Th>Commission / Reward Cost</Th>
                  <Th>Net</Th>
                  <Th>ROI</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.source}>
                    <Td className="font-medium">{r.source}</Td>
                    <Td className="font-mono">{inr(r.attributedRevenue)}</Td>
                    <Td className="font-mono">{inr(r.cost)}</Td>
                    <Td className="font-mono">{inr(r.net)}</Td>
                    <Td className="font-mono">{r.roi}x</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}
