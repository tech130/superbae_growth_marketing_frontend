"use client";

import { CampaignSourceView } from "@/components/CampaignSourceView";
import { num, inr } from "@/lib/format";

export default function PromoCampaignPage() {
  return (
    <CampaignSourceView
      sourceType="Promo"
      title="Promo Campaign"
      subtitle="Campaigns whose primary mechanic is a promo code (e.g. a flat 'WELCOME50' push), tracked as the centerpiece of a campaign rather than just a standalone code."
      refLabel="Promo Code"
      columns={[
        { label: "Redemptions", numeric: true, render: (c) => num(c.funnel.subscriptions) },
        { label: "Revenue", numeric: true, render: (c) => inr(c.funnel.revenue) },
      ]}
    />
  );
}
