"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { inr, num, dateShort } from "@/lib/format";
import { PageHeader, Card, KpiCard, StatusBadge, Button, Loading, ErrorState, Table, Th, Td, EmptyState } from "@/components/ui";

type Tab = "Overview" | "Campaigns" | "Offers & Coupons" | "Conversions" | "Revenue" | "Payout history";
const TABS: Tab[] = ["Overview", "Campaigns", "Offers & Coupons", "Conversions", "Revenue", "Payout history"];

interface BrandDetail {
  _id: string;
  name: string;
  category: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  website?: string;
  commissionArrangement: string;
  commissionValue: number;
  status: "pending" | "active" | "suspended" | "rejected";
  clicks: number;
  conversions: number;
  revenueGenerated: number;
  commissionEarned: number;
  commissionPaid: number;
  bankDetails?: { accountName?: string; accountNumber?: string; ifsc?: string };
  taxDetails?: { gst?: string };
  verifiedAt?: string;
  createdAt: string;
}

interface BrandOffer {
  _id: string;
  title: string;
  discountType: string;
  discountValue: number;
  couponCode?: string;
  validTill?: string;
  redemptions?: number;
  status: string;
}

interface BrandCampaign {
  _id: string;
  name: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  clicks?: number;
  conversions?: number;
  revenue?: number;
  status: string;
}

interface BrandPayout {
  _id: string;
  amount: number;
  payoutMethod: string;
  status: string;
  reference?: string;
  paidAt?: string;
  createdAt: string;
}

interface BrandConversion {
  _id: string;
  customerName: string;
  customerEmail: string;
  plan: string;
  orderAmount: number;
  commissionEarned: number;
  status: string;
  createdAt: string;
}

interface BrandProfileData {
  brand: BrandDetail;
  offers: BrandOffer[];
  campaigns: BrandCampaign[];
  payouts: BrandPayout[];
  conversions: BrandConversion[];
}

export default function BrandProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<BrandProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("Overview");
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get<BrandProfileData>(`/brand-management/brands/${id}`);
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load brand profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error || "Brand profile not found"} />;

  const { brand, offers = [], campaigns = [], payouts = [], conversions = [] } = data;
  const promoterLink = `http://localhost:4000/api/brand-management/track-promoter/${brand._id}`;
  const payableBalance = (brand.commissionEarned || 0) - (brand.commissionPaid || 0);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(promoterLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={brand.name}
        subtitle={`Partner Profile · ${brand.category} · Onboarded ${dateShort(brand.createdAt)}`}
        action={
          <div className="flex items-center gap-2">
            <Link
              href={`/brand-testing-website?brandId=${brand._id}&brandName=${encodeURIComponent(brand.name)}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--violet)] text-white px-3.5 py-2 text-xs font-semibold hover:bg-[#b03d82] transition-colors"
            >
              Test Promoter Link ↗
            </Link>
            <Link
              href="/brand"
              className="inline-flex items-center rounded-lg border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-xs font-medium text-[var(--ink)] hover:bg-[var(--violet-dim)] transition-colors"
            >
              ← Back to List
            </Link>
          </div>
        }
      />

      {/* Brand Profile Overview Card */}
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold font-display text-[var(--ink)]">{brand.name}</h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-[var(--violet-dim)] text-[var(--violet)]">
                {brand.category}
              </span>
              <StatusBadge status={brand.status === "active" ? "Active" : brand.status === "pending" ? "Pending" : "Suspended"} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-[var(--muted)]">
              {brand.contactPerson && (
                <div>
                  <span className="font-semibold text-[var(--ink)]">Contact:</span> {brand.contactPerson}
                </div>
              )}
              <div>
                <span className="font-semibold text-[var(--ink)]">Email:</span> {brand.email}
              </div>
              {brand.phone && (
                <div>
                  <span className="font-semibold text-[var(--ink)]">Phone:</span> {brand.phone}
                </div>
              )}
              {brand.website && (
                <div>
                  <span className="font-semibold text-[var(--ink)]">Website:</span>{" "}
                  <a href={brand.website} target="_blank" rel="noreferrer" className="text-[var(--violet)] hover:underline">
                    {brand.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-black/5 p-3 text-right">
            <div className="text-xs uppercase font-semibold text-[var(--muted)]">Commission Terms</div>
            <div className="font-mono text-sm font-bold text-[var(--ink)] mt-0.5">
              {brand.commissionArrangement === "revshare_percentage"
                ? `${brand.commissionValue || 10}% Revenue Share`
                : `Fixed ${inr(brand.commissionValue || 500)} / conversion`}
            </div>
            <div className="text-[11px] text-[var(--muted)] mt-0.5">Brand Partner Tier</div>
          </div>
        </div>

        {/* Direction 1: Unique Promoter Tracking Link */}
        <div className="mt-5 pt-4 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Promoter Tracking Link:</span>
            <code className="text-xs font-mono bg-black/5 text-[var(--violet)] px-2.5 py-1 rounded border border-[var(--line)] select-all">
              {promoterLink}
            </code>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={handleCopyLink}>
              {copied ? "✓ Copied Link" : "Copy Link"}
            </Button>
            <Link
              href={`/brand-testing-website?brandId=${brand._id}&brandName=${encodeURIComponent(brand.name)}`}
              className="text-xs font-semibold text-[var(--teal)] hover:underline"
            >
              Simulate Promoter Flow →
            </Link>
          </div>
        </div>
      </Card>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Clicks" value={num(brand.clicks || 0)} hint="Promoter link visits" accent="violet" />
        <KpiCard label="Conversions" value={num(brand.conversions || 0)} hint="Customer subscriptions" accent="teal" />
        <KpiCard label="Revenue Generated" value={inr(brand.revenueGenerated || 0)} hint="Gross merchandise value" accent="teal" />
        <KpiCard
          label="Commission Earned"
          value={inr(brand.commissionEarned || 0)}
          hint={`Payable: ${inr(payableBalance)}`}
          accent="amber"
        />
      </div>

      {/* 6 Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-[var(--line)]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-[1px] ${
              tab === t
                ? "border-[var(--violet)] text-[var(--violet)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {tab === "Overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-[var(--ink)]">Partnership & Commercial Details</h3>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-[var(--muted)]">Status:</dt>
              <dd className="font-semibold text-[var(--ink)] capitalize">{brand.status}</dd>
              <dt className="text-[var(--muted)]">Verified On:</dt>
              <dd className="font-mono text-[var(--ink)]">{brand.verifiedAt ? dateShort(brand.verifiedAt) : "Pending Verification"}</dd>
              <dt className="text-[var(--muted)]">Commission Type:</dt>
              <dd className="font-mono text-[var(--ink)]">{brand.commissionArrangement}</dd>
              <dt className="text-[var(--muted)]">Arrangement Value:</dt>
              <dd className="font-mono text-[var(--ink)]">{brand.commissionValue}</dd>
              <dt className="text-[var(--muted)]">Offers Count:</dt>
              <dd className="font-mono text-[var(--ink)]">{offers.length} active</dd>
              <dt className="text-[var(--muted)]">Campaigns Count:</dt>
              <dd className="font-mono text-[var(--ink)]">{campaigns.length} total</dd>
            </dl>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-[var(--ink)]">Banking & Tax Information</h3>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-[var(--muted)]">Account Name:</dt>
              <dd className="font-semibold text-[var(--ink)]">{brand.bankDetails?.accountName || "—"}</dd>
              <dt className="text-[var(--muted)]">Account Number:</dt>
              <dd className="font-mono text-[var(--ink)]">{brand.bankDetails?.accountNumber ? `••••${brand.bankDetails.accountNumber.slice(-4)}` : "—"}</dd>
              <dt className="text-[var(--muted)]">IFSC Code:</dt>
              <dd className="font-mono text-[var(--ink)]">{brand.bankDetails?.ifsc || "—"}</dd>
              <dt className="text-[var(--muted)]">GST Number:</dt>
              <dd className="font-mono text-[var(--ink)]">{brand.taxDetails?.gst || "—"}</dd>
              <dt className="text-[var(--muted)]">Settlement Method:</dt>
              <dd className="font-semibold text-[var(--ink)]">Direct NEFT / Bank Transfer</dd>
            </dl>
          </Card>
        </div>
      )}

      {/* Tab 2: Campaigns */}
      {tab === "Campaigns" && (
        <Card className="overflow-hidden">
          {campaigns.length === 0 ? (
            <div className="py-14 text-center">
              <EmptyState title="No campaigns running for this brand yet" subtitle="Create co-marketing promotions to track campaign-level attribution." />
              <Link href="/brand/campaigns" className="text-xs font-semibold text-[var(--violet)] hover:underline mt-2 inline-block">
                Create Campaign →
              </Link>
            </div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Campaign Name</Th>
                  <Th>Category</Th>
                  <Th>Duration</Th>
                  <Th>Clicks</Th>
                  <Th>Conversions</Th>
                  <Th>Revenue</Th>
                  <Th className="text-right">Status</Th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c._id}>
                    <Td className="font-bold text-[var(--ink)]">{c.name}</Td>
                    <Td>{c.category || brand.category}</Td>
                    <Td className="text-xs font-mono text-[var(--muted)]">
                      {c.startDate ? dateShort(c.startDate) : "Now"} – {c.endDate ? dateShort(c.endDate) : "Ongoing"}
                    </Td>
                    <Td className="font-mono">{num(c.clicks || 0)}</Td>
                    <Td className="font-mono font-bold text-[var(--teal)]">{num(c.conversions || 0)}</Td>
                    <Td className="font-mono">{inr(c.revenue || 0)}</Td>
                    <Td className="text-right"><StatusBadge status={c.status === "active" ? "Active" : "Completed"} /></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}

      {/* Tab 3: Offers & Coupons */}
      {tab === "Offers & Coupons" && (
        <Card className="overflow-hidden">
          {offers.length === 0 ? (
            <div className="py-14 text-center">
              <EmptyState title="No offers or coupons created for this brand" subtitle="Set up an exclusive discount or coupon code for Super Bae users." />
              <Link href="/brand/offers" className="text-xs font-semibold text-[var(--violet)] hover:underline mt-2 inline-block">
                Add Exclusive Offer →
              </Link>
            </div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Offer Title</Th>
                  <Th>Discount</Th>
                  <Th>Coupon Code</Th>
                  <Th>Expiry Date</Th>
                  <Th>Total Redemptions</Th>
                  <Th className="text-right">Status</Th>
                </tr>
              </thead>
              <tbody>
                {offers.map((o) => (
                  <tr key={o._id}>
                    <Td className="font-bold text-[var(--ink)]">{o.title}</Td>
                    <Td className="font-mono font-bold text-[var(--teal)]">
                      {o.discountType === "percentage" ? `${o.discountValue}% OFF` : inr(o.discountValue)}
                    </Td>
                    <Td className="font-mono font-bold text-[var(--violet)]">{o.couponCode || "—"}</Td>
                    <Td className="text-xs font-mono text-[var(--muted)]">{o.validTill ? dateShort(o.validTill) : "No expiry"}</Td>
                    <Td className="font-mono">{num(o.redemptions || 0)}</Td>
                    <Td className="text-right"><StatusBadge status={o.status === "active" ? "Active" : "Completed"} /></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}

      {/* Tab 4: Conversions */}
      {tab === "Conversions" && (
        <Card className="overflow-hidden">
          {conversions.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--muted)]">
              No customer conversions recorded for this brand yet.
              <div className="mt-2">
                <Link
                  href={`/brand-testing-website?brandId=${brand._id}&brandName=${encodeURIComponent(brand.name)}`}
                  className="inline-flex items-center text-xs font-semibold text-[var(--violet)] hover:underline"
                >
                  Test Promoter Flow & Create Live Conversion →
                </Link>
              </div>
            </div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Customer</Th>
                  <Th>Subscription Plan</Th>
                  <Th>Order Value</Th>
                  <Th>Commission Credited</Th>
                  <Th>Converted On</Th>
                  <Th className="text-right">Status</Th>
                </tr>
              </thead>
              <tbody>
                {conversions.map((cv) => (
                  <tr key={cv._id}>
                    <Td>
                      <p className="font-bold text-[var(--ink)]">{cv.customerName}</p>
                      <p className="text-xs text-[var(--muted)]">{cv.customerEmail}</p>
                    </Td>
                    <Td className="font-semibold text-[var(--ink)]">{cv.plan}</Td>
                    <Td className="font-mono font-bold text-[var(--teal)]">{inr(cv.orderAmount)}</Td>
                    <Td className="font-mono font-bold text-[var(--amber)]">+{inr(cv.commissionEarned)}</Td>
                    <Td className="text-xs font-mono text-[var(--muted)]">{dateShort(cv.createdAt)}</Td>
                    <Td className="text-right"><StatusBadge status="Approved" /></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}

      {/* Tab 5: Revenue */}
      {tab === "Revenue" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-xs text-[var(--muted)] font-semibold uppercase">Gross Revenue (GMV)</div>
              <div className="font-mono text-xl font-bold text-[var(--teal)] mt-1">{inr(brand.revenueGenerated || 0)}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-[var(--muted)] font-semibold uppercase">Total Commission Accrued</div>
              <div className="font-mono text-xl font-bold text-[var(--amber)] mt-1">{inr(brand.commissionEarned || 0)}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-[var(--muted)] font-semibold uppercase">Net Platform Revenue</div>
              <div className="font-mono text-xl font-bold text-[var(--ink)] mt-1">
                {inr((brand.revenueGenerated || 0) - (brand.commissionEarned || 0))}
              </div>
            </Card>
          </div>

          <Card className="p-6 space-y-3">
            <h3 className="font-display font-bold text-base text-[var(--ink)]">Commercial ROI & Unit Economics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-2">
              <div>
                <span className="text-[var(--muted)] block">Avg Order Value:</span>
                <span className="font-mono font-bold text-[var(--ink)]">
                  {brand.conversions > 0 ? inr(Math.round(brand.revenueGenerated / brand.conversions)) : "—"}
                </span>
              </div>
              <div>
                <span className="text-[var(--muted)] block">Effective Commission Rate:</span>
                <span className="font-mono font-bold text-[var(--ink)]">
                  {brand.revenueGenerated > 0
                    ? `${((brand.commissionEarned / brand.revenueGenerated) * 100).toFixed(1)}%`
                    : "—"}
                </span>
              </div>
              <div>
                <span className="text-[var(--muted)] block">Conversion Rate:</span>
                <span className="font-mono font-bold text-[var(--teal)]">
                  {brand.clicks > 0 ? `${((brand.conversions / brand.clicks) * 100).toFixed(1)}%` : "0%"}
                </span>
              </div>
              <div>
                <span className="text-[var(--muted)] block">Settled Commission:</span>
                <span className="font-mono font-bold text-[var(--ink)]">{inr(brand.commissionPaid || 0)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 6: Payout history */}
      {tab === "Payout history" && (
        <Card className="overflow-hidden">
          {payouts.length === 0 ? (
            <div className="py-14 text-center">
              <EmptyState title="No payouts disbursed to this brand yet" subtitle="Commission earnings can be settled through the payout manager." />
              <Link href="/brand/payouts" className="text-xs font-semibold text-[var(--violet)] hover:underline mt-2 inline-block">
                Go to Brand Payouts →
              </Link>
            </div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Reference</Th>
                  <Th>Amount</Th>
                  <Th>Payout Method</Th>
                  <Th>Initiated On</Th>
                  <Th className="text-right">Status</Th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p._id}>
                    <Td className="font-mono font-semibold text-[var(--ink)]">{p.reference || p._id.slice(-8)}</Td>
                    <Td className="font-mono font-bold text-[var(--teal)]">{inr(p.amount)}</Td>
                    <Td>{p.payoutMethod}</Td>
                    <Td className="text-xs font-mono text-[var(--muted)]">{dateShort(p.createdAt)}</Td>
                    <Td className="text-right"><StatusBadge status={p.status === "completed" ? "Paid" : "Pending"} /></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}
    </div>
  );
}
