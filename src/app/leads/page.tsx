"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Lead, Affiliate } from "@/lib/types";
import { dateShort } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function LeadsPage() {
  const [rows, setRows] = useState<Lead[] | null>(null);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<Lead[]>("/leads").then((r) => setRows(r.reverse())).catch((e) => setError(e.message));
    api.get<Affiliate[]>("/affiliates").then(setAffiliates).catch(() => {});
  }
  useEffect(load, []);

  const nameFor = (id: string) => affiliates.find((a) => a.id === id)?.name || id.slice(0, 6);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Affiliate Leads"
        subtitle="Users who clicked an affiliate link and signed up, but haven't converted into a paid subscription yet."
      />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No leads yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Lead / User</Th>
                <Th>Affiliate</Th>
                <Th>Signup date</Th>
                <Th>Verified</Th>
                <Th>Stage</Th>
                <Th>Attribution expires</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id}>
                  <Td className="font-medium">{l.userName}</Td>
                  <Td>{nameFor(l.affiliateId)}</Td>
                  <Td>{dateShort(l.signupDate)}</Td>
                  <Td>{l.verified ? "Yes" : "No"}</Td>
                  <Td>
                    <StatusBadge status={l.stage} />
                  </Td>
                  <Td className="text-[12px] text-[var(--muted)]">{dateShort(l.attributionExpiresAt)}</Td>
                  <Td>
                    {l.stage === "Awaiting Subscription" && (
                      <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => api.post(`/leads/${l.id}/extend`, { days: 7 }).then(load)}>
                          +7d window
                        </Button>
                        <Button variant="secondary" onClick={() => api.post(`/leads/${l.id}/lost`).then(load)}>
                          Mark lost
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
