"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Conversion } from "@/lib/types";
import { inr, dateShort } from "@/lib/format";
import { exportCsv } from "@/lib/csv";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function CreatorConversionsPage() {
  const [rows, setRows] = useState<Conversion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    api.get<Conversion[]>("/creators/conversions").then((r) => setRows(r.reverse())).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  async function flagInvalid(id: string) {
    setBusy(id);
    try {
      await api.post(`/conversions/${id}/flag-invalid`);
      load();
    } finally {
      setBusy(null);
    }
  }

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Creator Conversions"
        subtitle="Completed, qualified conversions driven by a creator's link within the attribution window."
        action={
          <Button
            variant="secondary"
            onClick={() =>
              exportCsv(
                "creator-conversions.csv",
                (rows || []).map((c) => ({
                  creator: c.creator,
                  user: c.userName,
                  convertedOn: c.convertedOn,
                  plan: c.subscriptionPlan,
                  revenue: c.revenue,
                  commission: c.commissionAmount ?? 0,
                  status: c.status,
                }))
              )
            }
          >
            Export
          </Button>
        }
      />

      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No creator conversions yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Creator</Th>
                <Th>Converted user</Th>
                <Th>Converted on</Th>
                <Th>Subscription</Th>
                <Th>Revenue</Th>
                <Th>Commission</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <Td className="font-medium">{c.creator}</Td>
                  <Td>{c.userName}</Td>
                  <Td>{dateShort(c.convertedOn)}</Td>
                  <Td>{c.subscriptionPlan}</Td>
                  <Td className="font-mono">{inr(c.revenue)}</Td>
                  <Td className="font-mono">{inr(c.commissionAmount ?? 0)}</Td>
                  <Td>
                    <StatusBadge status={c.status} />
                  </Td>
                  <Td>
                    {c.status === "Valid" && (
                      <Button variant="secondary" disabled={busy === c.id} onClick={() => flagInvalid(c.id)}>
                        Flag as invalid
                      </Button>
                    )}
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
