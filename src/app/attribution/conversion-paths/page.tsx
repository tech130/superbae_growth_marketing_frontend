"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr, dateShort } from "@/lib/format";
import { PageHeader, Card, Loading, EmptyState, ErrorState } from "@/components/ui";

interface Row {
  user: string;
  path: string[];
  sourceTypes: string[];
  touchpoints: number;
  convertedOn: string;
  revenue: number;
}

export default function ConversionPathsPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Row[]>("/attribution/conversion-paths").then(setRows).catch((e) => setError(e.message));
  }, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Conversion Paths"
        subtitle="The full multi-touch journey a converting user took across sources — the evidence behind how multi-touch credit is split."
      />
      {!rows ? (
        <Loading />
      ) : rows.length === 0 ? (
        <EmptyState title="No conversion paths yet" />
      ) : (
        <div className="space-y-3">
          {rows.map((r, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{r.user}</span>
                <span className="text-xs text-[var(--muted)]">
                  {dateShort(r.convertedOn)} · {r.touchpoints} touchpoints · <span className="font-mono">{inr(r.revenue)}</span>
                </span>
              </div>
              <div className="flex items-center flex-wrap gap-1.5 text-[12.5px]">
                {r.path.map((step, idx) => (
                  <span key={idx} className="flex items-center gap-1.5">
                    <span className="px-2 py-1 rounded-md bg-[var(--violet-dim)] text-[var(--violet)]">{step}</span>
                    {idx < r.path.length - 1 && <span className="text-[var(--muted)]">→</span>}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
