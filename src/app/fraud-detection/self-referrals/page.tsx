"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { FraudCase } from "@/lib/types";
import { PageHeader, Card, ErrorState } from "@/components/ui";
import { FraudCaseTable } from "@/components/FraudCaseTable";

export default function SelfReferralsPage() {
  const [rows, setRows] = useState<FraudCase[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api.get<FraudCase[]>("/fraud-detection?fraudType=SelfReferral").then(setRows).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Self-Referrals"
        subtitle="Cases where a user appears to have referred (or an affiliate converted) their own alternate account — one of the most common referral abuses."
      />
      <Card>
        <FraudCaseTable rows={rows} onChange={load} />
      </Card>
    </div>
  );
}
