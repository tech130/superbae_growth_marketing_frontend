"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { LandingPageTemplate } from "@/lib/types";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function LandingPageTemplatesPage() {
  const [rows, setRows] = useState<LandingPageTemplate[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<LandingPageTemplate[]>("/landing-pages/templates").then(setRows).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader title="Landing Page Templates" subtitle="A reusable library of pre-designed page layouts so the growth team can launch a new page quickly." />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No templates yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Template</Th>
                <Th>Best For</Th>
                <Th>Sections</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <Td className="font-medium">{t.name}</Td>
                  <Td>{t.bestFor}</Td>
                  <Td className="text-[12.5px] text-[var(--muted)]">{t.sections.join(", ")}</Td>
                  <Td><StatusBadge status={t.status} /></Td>
                  <Td>
                    {t.status === "Active" && (
                      <Button variant="secondary" onClick={() => api.post(`/landing-pages/templates/${t.id}/archive`).then(load)}>
                        Archive
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
