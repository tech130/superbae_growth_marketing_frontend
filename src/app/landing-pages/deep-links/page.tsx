"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { DeepLink } from "@/lib/types";
import { num } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function DeepLinksPage() {
  const [rows, setRows] = useState<DeepLink[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<DeepLink[]>("/landing-pages/deep-links").then(setRows).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Deep Links"
        subtitle="Deep and deferred links that route a user to the correct in-app screen — and preserve source/code context even when the app has to be installed first."
      />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No deep links yet" subtitle="Deep links are generated automatically when you create a landing page." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Deep Link</Th>
                <Th>Opens In-App</Th>
                <Th>Source</Th>
                <Th>Deferred</Th>
                <Th>Clicks</Th>
                <Th>Opens</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id}>
                  <Td className="font-mono text-xs">{d.scheme}</Td>
                  <Td>{d.opensInApp}</Td>
                  <Td>{d.sourceType}</Td>
                  <Td>{d.deferred ? "Yes" : "No"}</Td>
                  <Td className="font-mono">{num(d.clicks)}</Td>
                  <Td className="font-mono">{num(d.opens)}</Td>
                  <Td><StatusBadge status={d.status} /></Td>
                  <Td>
                    {d.status === "Active" ? (
                      <Button variant="secondary" onClick={() => api.post(`/landing-pages/deep-links/${d.id}/disable`).then(load)}>Disable</Button>
                    ) : (
                      <Button variant="secondary" onClick={() => api.post(`/landing-pages/deep-links/${d.id}/enable`).then(load)}>Enable</Button>
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
