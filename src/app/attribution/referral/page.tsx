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

export default function ReferralAttributionPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Row[]>("/attribution/referral").then(setRows).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader title="Referral Attribution" subtitle="How much conversion and revenue credit referrals earned under the active attribution model — confirmed before rewards are issued." />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No referral-credited conversions yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Referrer / Channel</Th>
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
