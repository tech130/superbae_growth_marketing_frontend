"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Loading, EmptyState, ErrorState } from "@/components/ui";

interface Row {
  conversion: string;
  lastTouch: string;
  creditedSource: string;
  revenue: number;
}

export default function LastTouchAttributionPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Row[]>("/attribution/last-touch").then(setRows).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader title="Last-Touch Attribution" subtitle="100% of the credit goes to the final source the user interacted with before subscribing — best for seeing who's best at closing." />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No conversions yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Conversion</Th>
                <Th>Last Touch</Th>
                <Th>Credited Source</Th>
                <Th>Revenue</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <Td className="font-medium">{r.conversion}</Td>
                  <Td>{r.lastTouch}</Td>
                  <Td><StatusBadge status={r.creditedSource} /></Td>
                  <Td className="font-mono">{inr(r.revenue)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
