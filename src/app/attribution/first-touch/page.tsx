"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Loading, EmptyState, ErrorState } from "@/components/ui";

interface Row {
  conversion: string;
  firstTouch: string;
  creditedSource: string;
  revenue: number;
}

export default function FirstTouchAttributionPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Row[]>("/attribution/first-touch").then(setRows).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader title="First-Touch Attribution" subtitle="100% of the credit goes to the source that first introduced the user to Super Bae — best for seeing who's best at discovery." />
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
                <Th>First Touch</Th>
                <Th>Credited Source</Th>
                <Th>Revenue</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <Td className="font-medium">{r.conversion}</Td>
                  <Td>{r.firstTouch}</Td>
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
