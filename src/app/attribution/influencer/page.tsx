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

export default function InfluencerAttributionPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Row[]>("/attribution/influencer").then(setRows).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader title="Influencer Attribution" subtitle="Credit assigned to creators for the paying users their content drove — confirmed before commission is calculated." />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No creator-credited conversions yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Creator</Th>
                <Th>Attributed Conversions</Th>
                <Th>Revenue</Th>
                <Th>Model</Th>
                <Th>Share of User</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name}>
                  <Td className="font-medium">{r.name}</Td>
                  <Td className="font-mono">{num(r.attributedConversions)}</Td>
                  <Td className="font-mono">{inr(r.revenue)}</Td>
                  <Td className="capitalize">{r.model.replace("-", " ")}</Td>
                  <Td className="font-mono">{r.shareOfUser}%</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
