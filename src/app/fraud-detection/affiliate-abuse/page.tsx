"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { FraudCase } from "@/lib/types";
import { PageHeader, Card, ErrorState } from "@/components/ui";
import { FraudCaseTable } from "@/components/FraudCaseTable";

export default function AffiliateAbusePage() {
  const [rows, setRows] = useState<FraudCase[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<FraudCase[]>("/fraud-detection?fraudType=AffiliateAbuse").then(setRows).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Affiliate Abuse"
        subtitle="Affiliates driving fake traffic or bot clicks — huge click volume with near-zero real usage, inflating commission before it's paid out."
      />
      <Card>
        <FraudCaseTable rows={rows} onChange={load} />
      </Card>
    </div>
  );
}
