"use client";

import { CampaignSourceView } from "@/components/CampaignSourceView";
import { num, inr } from "@/lib/format";

export default function ReferralCampaignPage() {
  return (
    <CampaignSourceView
      sourceType="Referral"
      title="Referral Campaign"
      subtitle="Campaigns built on top of Referral Management — e.g. a limited-time double-reward referral push, run inside the same campaign framework as every other source."
      refLabel="Linked Referral Rule"
      columns={[
        { label: "Clicks", numeric: true, render: (c) => num(c.funnel.clicks) },
        { label: "Successful Referrals", numeric: true, render: (c) => num(c.funnel.subscriptions) },
        { label: "Revenue", numeric: true, render: (c) => inr(c.funnel.revenue) },
      ]}
    />
  );
}
