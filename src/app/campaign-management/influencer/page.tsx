"use client";

import { CampaignSourceView } from "@/components/CampaignSourceView";
import { num, inr } from "@/lib/format";

export default function InfluencerCampaignPage() {
  return (
    <CampaignSourceView
      sourceType="Influencer"
      title="Influencer Campaign"
      subtitle="Creator-driven campaigns — the same underlying record as Creator Campaigns in Influencer/Creator Management — reported alongside every other acquisition source."
      refLabel="Creator"
      columns={[
        { label: "Reach", numeric: true, render: (c) => num(c.funnel.impressions) },
        { label: "Conversions", numeric: true, render: (c) => num(c.funnel.subscriptions) },
        { label: "Revenue", numeric: true, render: (c) => inr(c.funnel.revenue) },
      ]}
    />
  );
}
