"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inr, num } from "@/lib/format";
import { PageHeader, Card, KpiCard, Loading, ErrorState } from "@/components/ui";

type FunnelData = {
  linkClicks: number;
  registrations: number;
  verified: number;
  subscribed: number;
  successfulReferrals: number;
  clickToSignup: number;
  signupToVerification: number;
  verificationToSubscription: number;
  overallConversion: number;
  rewardCost: number;
  costPerReferral: number;
};

export default function ReferralFunnelPage() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get<FunnelData>("/admin/analytics/funnel");
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load funnel analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorState message={error} />;

  const steps = [
    { label: "1. Link Clicks", value: data?.linkClicks || 0, pct: 100, color: "bg-[var(--violet)]" },
    {
      label: "2. User Registrations",
      value: data?.registrations || 0,
      pct: data?.clickToSignup || 0,
      color: "bg-[#b03d82]",
    },
    {
      label: "3. Account Verifications",
      value: data?.verified || 0,
      pct: data?.signupToVerification || 0,
      color: "bg-[var(--amber)]",
    },
    {
      label: "4. Paid Subscriptions",
      value: data?.subscribed || 0,
      pct: data?.verificationToSubscription || 0,
      color: "bg-[var(--teal)]",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referral Conversion Funnel"
        subtitle="End-to-end attribution journey from initial click to verified paid subscriber."
        action={
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] px-4 py-2 text-sm font-medium hover:bg-[var(--violet-dim)] transition-colors"
          >
            Refresh
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Overall Conversion"
          value={`${data?.overallConversion || 0}%`}
          hint="Click to Subscription"
          accent="violet"
        />
        <KpiCard
          label="Total Reward Spend"
          value={inr(data?.rewardCost || 0)}
          hint="Distributed incentives"
          accent="teal"
        />
        <KpiCard
          label="Effective Cost Per Referral"
          value={inr(data?.costPerReferral || 0)}
          hint="Per paid subscription"
          accent="amber"
        />
      </div>

      <Card className="p-6 max-w-4xl space-y-6">
        <div className="font-display font-bold text-lg text-[var(--ink)]">Step-by-Step Conversion Flow</div>

        <div className="space-y-5">
          {steps.map((step, idx) => (
            <div key={step.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-[var(--ink)]">{step.label}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[var(--ink)]">{num(step.value)}</span>
                  {idx > 0 && <span className="text-xs text-[var(--muted)]">({step.pct}% step-through)</span>}
                </div>
              </div>
              <div className="h-6 w-full rounded-full bg-black/5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${step.color} transition-all duration-500`}
                  style={{ width: `${Math.max(5, Math.min(100, (step.value / (data?.linkClicks || 1)) * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
