"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = { href: string; label: string };
type NavSubGroup = { label: string; items: NavItem[] };
type NavModule = { key: string; label: string; subGroups: NavSubGroup[] };

const modules: NavModule[] = [
  {
    key: "affiliates",
    label: "Affiliates Management & Commission Engine",
    subGroups: [
      {
        label: "Overview",
        items: [{ href: "/", label: "Dashboard" }],
      },
      {
        label: "Onboarding",
        items: [
          { href: "/affiliates", label: "Affiliate List" },
          { href: "/affiliates/new", label: "Add Affiliate" },
          { href: "/approvals", label: "Approvals" },
        ],
      },
      {
        label: "Promotion",
        items: [
          { href: "/links", label: "Links" },
          { href: "/campaigns", label: "Campaigns" },
          { href: "/clicks", label: "Clicks" },
        ],
      },
      {
        label: "Funnel",
        items: [
          { href: "/leads", label: "Leads" },
          { href: "/conversions", label: "Conversions" },
          { href: "/revenue", label: "Revenue" },
        ],
      },
      {
        label: "Commission Engine",
        items: [
          { href: "/commissions", label: "Commission Ledger" },
          { href: "/payouts", label: "Payout History" },
        ],
      },
      {
        label: "Insights",
        items: [
          { href: "/performance", label: "Performance" },
          { href: "/fraud", label: "Fraud Detection" },
        ],
      },
    ],
  },
  {
    key: "creators",
    label: "Creator / Influencer Management",
    subGroups: [
      {
        label: "Overview",
        items: [{ href: "/creators/dashboard", label: "Creator Dashboard" }],
      },
      {
        label: "Onboarding",
        items: [
          { href: "/creators", label: "Creator List" },
          { href: "/creators/new", label: "Add Creator" },
          { href: "/creators/verification", label: "Creator Verification" },
          { href: "/creators/social-profiles", label: "Social Profiles" },
          { href: "/creators/referral-links", label: "Creator Referral Links" },
        ],
      },
      {
        label: "Promotion",
        items: [{ href: "/creators/campaigns", label: "Creator Campaigns" }],
      },
      {
        label: "Performance & Payouts",
        items: [
          { href: "/creators/revenue", label: "Creator Revenue" },
          { href: "/creators/conversions", label: "Creator Conversions" },
          { href: "/creators/commission", label: "Creator Commission" },
          { href: "/creators/payouts", label: "Creator Payouts" },
          { href: "/creators/performance", label: "Creator Performance" },
        ],
      },
    ],
  },
  {
    key: "campaign-management",
    label: "Campaign Management",
    subGroups: [
      {
        label: "Overview",
        items: [{ href: "/campaign-management/dashboard", label: "Campaign Dashboard" }],
      },
      {
        label: "Setup",
        items: [
          { href: "/campaign-management", label: "Campaign List" },
          { href: "/campaign-management/new", label: "Create Campaign" },
          { href: "/campaign-management/audience", label: "Audience" },
          { href: "/campaign-management/budget", label: "Campaign Budget" },
        ],
      },
      {
        label: "Source Views",
        items: [
          { href: "/campaign-management/referral", label: "Referral Campaign" },
          { href: "/campaign-management/affiliate", label: "Affiliate Campaign" },
          { href: "/campaign-management/influencer", label: "Influencer Campaign" },
          { href: "/campaign-management/promo", label: "Promo Campaign" },
          { href: "/campaign-management/coupon", label: "Coupon Campaign" },
        ],
      },
      {
        label: "Insights",
        items: [{ href: "/campaign-management/performance", label: "Campaign Performance" }],
      },
    ],
  },
  {
    key: "referral",
    label: "Referral Management",
    subGroups: [
      {
        label: "Overview",
        items: [
          { href: "/referral/dashboard", label: "Referral Dashboard" },
          { href: "/referral/funnel", label: "Conversion Funnel" },
          { href: "/referral/leaderboard", label: "Leaderboard" },
        ],
      },
      {
        label: "Program Setup",
        items: [
          { href: "/referral/program-settings", label: "Program Settings" },
          { href: "/referral/rules", label: "Referral Rules" },
          { href: "/referral/types", label: "Reward Types" },
          { href: "/referral/codes", label: "Referral Codes" },
          { href: "/referral/links", label: "Referral Links" },
        ],
      },
      {
        label: "Tracking & Approvals",
        items: [
          { href: "/referral/pending", label: "Pending Referrals" },
          { href: "/referral/successful", label: "Successful Referrals" },
          { href: "/referral/rejected", label: "Rejected Referrals" },
        ],
      },
      {
        label: "Rewards & Wallet",
        items: [
          { href: "/referral/rewards", label: "Reward Ledger" },
          { href: "/referral/wallet", label: "Wallet Lookup" },
        ],
      },
      {
        label: "Trust & History",
        items: [
          { href: "/referral/fraud", label: "Fraud Detection" },
          { href: "/referral/history", label: "Referral History" },
        ],
      },
    ],
  },
  {
    key: "brand",
    label: "Partner / Brand Management",
    subGroups: [
      {
        label: "Overview",
        items: [{ href: "/brand/dashboard", label: "Brand Dashboard" }],
      },
      {
        label: "Partners",
        items: [
          { href: "/brand", label: "Brand List" },
          { href: "/brand/new", label: "Add Brand" },
          { href: "/brand/verification", label: "Brand Verification" },
        ],
      },
      {
        label: "Promotions & Offers",
        items: [
          { href: "/brand/campaigns", label: "Brand Campaigns" },
          { href: "/brand/offers", label: "Brand Offers" },
          { href: "/brand/coupons", label: "Coupons" },
          { href: "/brand/promo-codes", label: "Brand Promo Codes" },
        ],
      },
      {
        label: "Performance & Finance",
        items: [
          { href: "/brand/performance", label: "Brand Performance" },
          { href: "/brand/revenue", label: "Brand Revenue" },
          { href: "/brand/payouts", label: "Brand Payouts" },
        ],
      },
    ],
  },
  {
    key: "promo",
    label: "Promo Code Management",
    subGroups: [
      {
        label: "Overview",
        items: [{ href: "/promo/dashboard", label: "Promo Dashboard" }],
      },
      {
        label: "Setup & Management",
        items: [
          { href: "/promo", label: "Promo Code List" },
          { href: "/promo/new", label: "Create Promo Code" },
          { href: "/promo/usage-history", label: "Usage History" },
          { href: "/promo/expired", label: "Expired Codes" },
        ],
      },
      {
        label: "Source Breakdown",
        items: [
          { href: "/promo/referral", label: "Referral Codes" },
          { href: "/promo/affiliate", label: "Affiliate Codes" },
          { href: "/promo/creator", label: "Creator Codes" },
          { href: "/promo/campaign", label: "Campaign Codes" },
        ],
      },
    ],
  },
  {
    key: "payout-management",
    label: "Payout Management",
    subGroups: [
      {
        label: "Overview",
        items: [{ href: "/payout-management", label: "Payout Dashboard" }],
      },
      {
        label: "Queue",
        items: [
          { href: "/payout-management/pending", label: "Pending Payouts" },
          { href: "/payout-management/approved", label: "Approved Payouts" },
          { href: "/payout-management/processing", label: "Processing" },
          { href: "/payout-management/completed", label: "Completed" },
          { href: "/payout-management/failed", label: "Failed" },
        ],
      },
      {
        label: "By Partner",
        items: [
          { href: "/payout-management/affiliate", label: "Affiliate Payouts" },
          { href: "/payout-management/creator", label: "Creator Payouts" },
          { href: "/payout-management/brand", label: "Brand Payouts" },
        ],
      },
      {
        label: "Compliance",
        items: [{ href: "/payout-management/tax-invoice", label: "Tax / Invoice Details" }],
      },
    ],
  },
  {
    key: "fraud-detection",
    label: "Fraud Detection",
    subGroups: [
      {
        label: "Overview",
        items: [
          { href: "/fraud-detection", label: "Fraud Dashboard" },
          { href: "/fraud-detection/suspicious-referrals", label: "Suspicious Referrals" },
        ],
      },
      {
        label: "Signals",
        items: [
          { href: "/fraud-detection/duplicate-devices", label: "Duplicate Devices" },
          { href: "/fraud-detection/duplicate-accounts", label: "Duplicate Accounts" },
          { href: "/fraud-detection/suspicious-ips", label: "Suspicious IPs" },
          { href: "/fraud-detection/self-referrals", label: "Self-Referrals" },
          { href: "/fraud-detection/abnormal-conversion", label: "Abnormal Conversion" },
        ],
      },
      {
        label: "Abuse Patterns",
        items: [
          { href: "/fraud-detection/reward-abuse", label: "Reward Abuse" },
          { href: "/fraud-detection/affiliate-abuse", label: "Affiliate Abuse" },
        ],
      },
    ],
  },
  {
    key: "landing-pages",
    label: "Landing Pages & Deep Links",
    subGroups: [
      {
        label: "Overview",
        items: [{ href: "/landing-pages", label: "Landing Page Dashboard" }],
      },
      {
        label: "Build",
        items: [
          { href: "/landing-pages/create", label: "Create Landing Page" },
          { href: "/landing-pages/templates", label: "Templates" },
        ],
      },
      {
        label: "By Source",
        items: [
          { href: "/landing-pages/campaign", label: "Campaign Landing Pages" },
          { href: "/landing-pages/referral", label: "Referral Landing Pages" },
          { href: "/landing-pages/affiliate", label: "Affiliate Landing Pages" },
        ],
      },
      {
        label: "Routing",
        items: [
          { href: "/landing-pages/deep-links", label: "Deep Links" },
          { href: "/landing-pages/qr-codes", label: "QR Codes" },
        ],
      },
      {
        label: "Insights",
        items: [{ href: "/landing-pages/analytics", label: "Link Analytics" }],
      },
    ],
  },
  {
    key: "attribution",
    label: "Attribution Dashboard",
    subGroups: [
      {
        label: "Overview",
        items: [
          { href: "/attribution", label: "Attribution Dashboard" },
          { href: "/attribution/source-analytics", label: "Source Analytics" },
        ],
      },
      {
        label: "By Source",
        items: [
          { href: "/attribution/referral", label: "Referral Attribution" },
          { href: "/attribution/influencer", label: "Influencer Attribution" },
          { href: "/attribution/campaign", label: "Campaign Attribution" },
        ],
      },
      {
        label: "Models",
        items: [
          { href: "/attribution/first-touch", label: "First-Touch Attribution" },
          { href: "/attribution/last-touch", label: "Last-Touch Attribution" },
          { href: "/attribution/conversion-paths", label: "Conversion Paths" },
        ],
      },
      {
        label: "Finance",
        items: [{ href: "/attribution/revenue", label: "Revenue Attribution" }],
      },
    ],
  },
  {
    key: "loyalty",
    label: "Loyalty Program",
    subGroups: [
      {
        label: "Overview",
        items: [{ href: "/loyalty", label: "Loyalty Dashboard" }],
      },
      {
        label: "Program Setup",
        items: [
          { href: "/loyalty/rules", label: "Loyalty Rules" },
          { href: "/loyalty/tiers", label: "Tiers" },
        ],
      },
      {
        label: "Members & Points",
        items: [
          { href: "/loyalty/members", label: "User Tier List" },
          { href: "/loyalty/points", label: "Points" },
        ],
      },
      {
        label: "Rewards",
        items: [
          { href: "/loyalty/rewards", label: "Rewards" },
          { href: "/loyalty/benefits", label: "Benefits" },
        ],
      },
      {
        label: "Engagement",
        items: [
          { href: "/loyalty/leaderboard", label: "Leaderboard" },
          { href: "/loyalty/redemptions", label: "Redemption History" },
        ],
      },
    ],
  },
];

function moduleForPath(pathname: string): string {
  if (pathname.startsWith("/creators")) return "creators";
  if (pathname.startsWith("/campaign-management")) return "campaign-management";
  if (pathname.startsWith("/referral")) return "referral";
  if (pathname.startsWith("/brand")) return "brand";
  if (pathname.startsWith("/promo")) return "promo";
  if (pathname.startsWith("/payout-management")) return "payout-management";
  if (pathname.startsWith("/fraud-detection")) return "fraud-detection";
  if (pathname.startsWith("/landing-pages")) return "landing-pages";
  if (pathname.startsWith("/attribution")) return "attribution";
  if (pathname.startsWith("/loyalty")) return "loyalty";
  return "affiliates";
}

export default function Sidebar() {
  const pathname = usePathname();
  const [openModule, setOpenModule] = useState<string>(() => moduleForPath(pathname));

  const toggleModule = (key: string) => {
    setOpenModule((current) => (current === key ? "" : key));
  };

  return (
    <aside className="w-70 shrink-0 h-screen sticky top-0 flex flex-col bg-[var(--paper)] text-white/95">
      <div className="px-5 py-6 flex items-center border-b border-black/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://www.superbae.co/logo.svg" alt="Super Bae" className="h-8 w-auto" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {modules.map((mod) => {
          const isOpen = openModule === mod.key;
          return (
            <div key={mod.key}>
              <button
                type="button"
                onClick={() => toggleModule(mod.key)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-md text-[13px] font-semibold text-black/85 hover:bg-black/5 transition-colors"
              >
                <span>{mod.label}</span>
                <svg
                  className={`h-3.5 w-3.5 shrink-0 transition-transform duration-150 ${
                    isOpen ? "rotate-180" : "rotate-0"
                  }`}
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {isOpen && (
                <div className="mt-1 space-y-3 pb-1">
                  {mod.subGroups.map((g) => (
                    <div key={g.label}>
                      <div className="px-2 text-[10px] uppercase tracking-wider text-black/60 font-semibold mb-1.5">
                        {g.label}
                      </div>
                      <div className="space-y-0.5">
                        {g.items.map((item) => {
                          const active = pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`block px-2.5 py-1.5 ml-1 rounded-md text-[13.5px] transition-colors ${
                                active
                                  ? "bg-[var(--violet)] text-white font-medium"
                                  : "text-black/70 hover:text-black hover:bg-black/5"
                              }`}
                            >
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
