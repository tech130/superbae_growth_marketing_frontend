"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { FraudCase } from "@/lib/types";
import { PageHeader, Card, ErrorState } from "@/components/ui";
import { FraudCaseTable } from "@/components/FraudCaseTable";

export default function DuplicateDevicesPage() {
  const [rows, setRows] = useState<FraudCase[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<FraudCase[]>("/fraud-detection?fraudType=Device").then(setRows).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Duplicate Devices"
        subtitle="Referrals/conversions that share the same device fingerprint across multiple 'different' accounts — one of the strongest signals of self-referral or reward farming."
      />
      <Card>
        <FraudCaseTable rows={rows} onChange={load} />
      </Card>
    </div>
  );
}
