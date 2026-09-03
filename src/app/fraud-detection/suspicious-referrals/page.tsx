"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { FraudCase } from "@/lib/types";
import { PageHeader, Card, ErrorState } from "@/components/ui";
import { FraudCaseTable } from "@/components/FraudCaseTable";

export default function SuspiciousReferralsPage() {
  const [rows, setRows] = useState<FraudCase[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<FraudCase[]>("/fraud-detection").then(setRows).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Suspicious Referrals"
        subtitle="The master queue of every flagged referral, affiliate, creator or brand case, ranked by risk score, before any reward or commission is released."
      />
      <Card>
        <FraudCaseTable rows={rows} onChange={load} />
      </Card>
    </div>
  );
}
