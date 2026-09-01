"use client";

import { CampaignSourceView } from "@/components/CampaignSourceView";
import { num, inr } from "@/lib/format";

export default function AffiliateCampaignPage() {
  return (
    <CampaignSourceView
      sourceType="Affiliate"
      title="Affiliate Campaign"
      subtitle="Campaigns run by specific affiliates or affiliate cohorts, reported inside the same cross-channel dashboard as every other acquisition source."
      refLabel="Affiliate"
      columns={[
        { label: "Clicks", numeric: true, render: (c) => num(c.funnel.clicks) },
        { label: "Conversions", numeric: true, render: (c) => num(c.funnel.subscriptions) },
        { label: "Revenue", numeric: true, render: (c) => inr(c.funnel.revenue) },
      ]}
    />
  );
}
