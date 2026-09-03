"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { FraudCase } from "@/lib/types";
import { PageHeader, Card, ErrorState } from "@/components/ui";
import { FraudCaseTable } from "@/components/FraudCaseTable";

export default function AbnormalConversionPage() {
  const [rows, setRows] = useState<FraudCase[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<FraudCase[]>("/fraud-detection?fraudType=AbnormalConversion").then(setRows).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Abnormal Conversion"
        subtitle="Statistically unusual conversion behaviour — sudden spikes or near-100% conversion rates that look legitimate record-by-record but are abnormal in aggregate."
      />
      <Card>
        <FraudCaseTable rows={rows} onChange={load} />
      </Card>
    </div>
  );
}
