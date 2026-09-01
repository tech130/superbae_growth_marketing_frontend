"use client";

import { CampaignSourceView } from "@/components/CampaignSourceView";
import { num, inr } from "@/lib/format";

export default function CouponCampaignPage() {
  return (
    <CampaignSourceView
      sourceType="Coupon"
      title="Coupon Campaign"
      subtitle="A brand-offer/coupon-led campaign — the same underlying record as Brand Campaigns — tracked inside the same cross-channel funnel as every other source."
      refLabel="Brand / Coupon"
      columns={[
        { label: "Redemptions", numeric: true, render: (c) => num(c.funnel.subscriptions) },
        { label: "Revenue", numeric: true, render: (c) => inr(c.funnel.revenue) },
      ]}
    />
  );
}
