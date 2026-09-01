"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { CampaignRecord } from "@/lib/types";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Loading, EmptyState, ErrorState } from "@/components/ui";

interface ColumnDef {
  label: string;
  numeric?: boolean;
  render: (c: CampaignRecord) => React.ReactNode;
}

/**
 * Shared table for the 5 Campaign Management "source view" screens (Referral
 * / Affiliate / Influencer / Promo / Coupon Campaign) — per the spec, these
 * are filtered views of the same underlying campaign record, not separate
 * data models, so they share one component differing only in labels/columns.
 */
export function CampaignSourceView({
  sourceType,
  title,
  subtitle,
  refLabel,
  columns,
}: {
  sourceType: CampaignRecord["sourceType"];
  title: string;
  subtitle: string;
  refLabel: string;
  columns: ColumnDef[];
}) {
  const [rows, setRows] = useState<CampaignRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<CampaignRecord[]>(`/campaign-management?sourceType=${sourceType}`)
      .then(setRows)
      .catch((e) => setError(e.message));
  }, [sourceType]);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title={`No ${sourceType.toLowerCase()} campaigns yet`} />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Campaign</Th>
                <Th>{refLabel}</Th>
                {columns.map((c) => (
                  <Th key={c.label}>{c.label}</Th>
                ))}
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <Td className="font-medium">
                    <Link href={`/campaign-management/${c.id}`} className="hover:text-[var(--violet)]">
                      {c.name}
                    </Link>
                  </Td>
                  <Td>{c.linkedRefLabel || "—"}</Td>
                  {columns.map((col) => (
                    <Td key={col.label} className={col.numeric ? "font-mono" : ""}>
                      {col.render(c)}
                    </Td>
                  ))}
                  <Td>
                    <StatusBadge status={c.status} />
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
