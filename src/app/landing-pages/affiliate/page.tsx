"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { LandingPage } from "@/lib/types";
import { num } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function AffiliateLandingPagesPage() {
  const [rows, setRows] = useState<LandingPage[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<LandingPage[]>("/landing-pages?sourceType=Affiliate").then(setRows).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader title="Affiliate Landing Pages" subtitle="The destination for an affiliate's tracking link, carrying the affiliate code through the install for commission attribution." />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No affiliate landing pages yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Page</Th>
                <Th>Affiliate</Th>
                <Th>Visits</Th>
                <Th>Installs</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <Td className="font-medium">{p.name}</Td>
                  <Td>{p.linkedRefLabel ?? "—"}</Td>
                  <Td className="font-mono">{num(p.visits)}</Td>
                  <Td className="font-mono">{num(p.installs)}</Td>
                  <Td><StatusBadge status={p.status} /></Td>
                  <Td className="flex gap-2">
                    {p.status === "Active" && (
                      <>
                        <Button variant="secondary" onClick={() => api.post(`/landing-pages/${p.id}/simulate`).then(load)}>Simulate traffic</Button>
                        <Button variant="secondary" onClick={() => api.post(`/landing-pages/${p.id}/pause`).then(load)}>Pause</Button>
                      </>
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
