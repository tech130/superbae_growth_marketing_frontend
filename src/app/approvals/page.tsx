"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Affiliate } from "@/lib/types";
import { dateShort } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function ApprovalsPage() {
  const [rows, setRows] = useState<Affiliate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    api
      .get<Affiliate[]>("/affiliates?status=Pending")
      .then(setRows)
      .catch((e) => setError(e.message));
  }
  useEffect(load, []);

  async function approve(id: string) {
    setBusy(id);
    try {
      await api.post(`/affiliates/${id}/approve`);
      load();
    } finally {
      setBusy(null);
    }
  }

  async function reject(id: string) {
    const reason = window.prompt("Reason for rejection?") || "Not specified";
    setBusy(id);
    try {
      await api.post(`/affiliates/${id}/reject`, { reason });
      load();
    } finally {
      setBusy(null);
    }
  }

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Affiliate Approval"
        subtitle="Review new affiliate applications before they go live. Approving auto-generates the referral code and tracking link."
      />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="Nothing pending" subtitle="All applications have been reviewed." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Applicant</Th>
                <Th>Company / Brand</Th>
                <Th>Category</Th>
                <Th>Requested tier</Th>
                <Th>Applied on</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <Td className="font-medium">{a.name}</Td>
                  <Td>{a.company || "—"}</Td>
                  <Td>{a.category}</Td>
                  <Td>{a.tier}</Td>
                  <Td>{dateShort(a.createdAt)}</Td>
                  <Td>
                    <div className="flex gap-2">
                      <Button disabled={busy === a.id} onClick={() => approve(a.id)}>
                        Approve
                      </Button>
                      <Button variant="secondary" disabled={busy === a.id} onClick={() => reject(a.id)}>
                        Reject
                      </Button>
                    </div>
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
