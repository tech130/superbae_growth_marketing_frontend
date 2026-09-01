"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { FraudFlag } from "@/lib/types";
import { dateShort } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function FraudPage() {
  const [rows, setRows] = useState<FraudFlag[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<FraudFlag[]>("/fraud").then((r) => setRows(r.reverse())).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Affiliate Fraud Detection"
        subtitle="Suspicious affiliate activity identified before commission is paid out. A risk score of 35+ auto-opens an investigation; 70+ locks the conversion out of approval."
      />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No flags" subtitle="Nothing has tripped the fraud heuristics yet." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Affiliate</Th>
                <Th>Risk</Th>
                <Th>Reasons</Th>
                <Th>Flagged on</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr key={f.id}>
                  <Td className="font-medium">{f.affiliate}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={f.riskLevel} />
                      <span className="font-mono text-xs">{f.riskScore}/100</span>
                    </div>
                  </Td>
                  <Td className="text-[12.5px] text-[var(--muted)] max-w-sm">{f.reasons.join("; ")}</Td>
                  <Td>{dateShort(f.createdAt)}</Td>
                  <Td>
                    <StatusBadge status={f.status} />
                  </Td>
                  <Td>
                    {f.status === "Investigating" && (
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="secondary" onClick={() => api.post(`/fraud/${f.id}/hold`).then(load)}>
                          Hold commission
                        </Button>
                        <Button onClick={() => api.post(`/fraud/${f.id}/legitimate`).then(load)}>Mark legitimate</Button>
                        <Button variant="danger" onClick={() => api.post(`/fraud/${f.id}/confirm-fraud`).then(load)}>
                          Confirm fraud
                        </Button>
                        <Button variant="secondary" onClick={() => api.post(`/fraud/${f.id}/suspend-affiliate`).then(load)}>
                          Suspend affiliate
                        </Button>
                      </div>
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
