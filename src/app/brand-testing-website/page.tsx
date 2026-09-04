"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { inr } from "@/lib/format";
import { PageHeader, Card, Button } from "@/components/ui";

interface BrandItem {
  _id: string;
  name: string;
  category: string;
  status: string;
  website?: string;
  clicks: number;
  conversions: number;
  revenueGenerated: number;
  commissionEarned: number;
}

const PLANS = [
  { name: "Plus", price: 999, description: "Monthly individual access" },
  { name: "Premium", price: 1999, description: "All features unlocked + priority perks" },
  { name: "Premium Annual", price: 4999, description: "Best value: Full yearly membership" },
];

function BrandTestingStorefrontContent() {
  const searchParams = useSearchParams();
  const initialBrandId = searchParams.get("brandId");

  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>(initialBrandId || "");
  const [loadingBrands, setLoadingBrands] = useState(true);

  // Attribution & Funnel State
  const [attributionActive, setAttributionActive] = useState(false);
  const [clickCountSession, setClickCountSession] = useState(0);
  const [customerName, setCustomerName] = useState("Kiran Patel");
  const [customerEmail, setCustomerEmail] = useState("kiran.patel@example.com");
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1]);
  const [submitting, setSubmitting] = useState(false);
  const [conversionSuccess, setConversionSuccess] = useState<any>(null);
  const [logs, setLogs] = useState<Array<{ time: string; msg: string; type: "info" | "success" | "click" }>>([]);

  const addLog = (msg: string, type: "info" | "success" | "click" = "info") => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, msg, type }, ...prev]);
  };

  useEffect(() => {
    api
      .get<BrandItem[]>("/brand-management/brands")
      .then((res) => {
        setBrands(res || []);
        if (res && res.length > 0 && !selectedBrandId) {
          const defaultBrand = res.find((b) => b._id === initialBrandId) || res[0];
          setSelectedBrandId(defaultBrand._id);
        }
      })
      .catch((e) => addLog(`Failed to load brands: ${e.message}`, "info"))
      .finally(() => setLoadingBrands(false));
  }, [initialBrandId]);

  const activeBrand = brands.find((b) => b._id === selectedBrandId);

  const handleSimulateVisitorClick = async () => {
    if (!activeBrand) return;
    try {
      addLog(`Visitor clicked promoter link on ${activeBrand.name}'s website...`, "click");
      const res: any = await api.post(`/brand-management/brands/${activeBrand._id}/click`);
      setAttributionActive(true);
      setClickCountSession((c) => c + 1);
      addLog(`✓ Click logged in backend for ${activeBrand.name}. Total live clicks: ${res.clicks}`, "success");
    } catch (err: any) {
      addLog(`Error recording click: ${err.message}`, "info");
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBrand) return;

    try {
      setSubmitting(true);
      addLog(`Processing customer subscription checkout for ₹${selectedPlan.price}...`, "info");
      const res: any = await api.post("/brand-management/promoter-conversion", {
        brandId: activeBrand._id,
        customerName,
        customerEmail,
        plan: selectedPlan.name,
        orderAmount: selectedPlan.price,
      });

      setConversionSuccess(res);
      addLog(
        `🎉 Conversion successful! Order: ₹${selectedPlan.price} · Commission Credited to ${activeBrand.name}: ₹${res.conversion.commissionEarned}`,
        "success"
      );

      // Refresh brand stats
      const updatedBrands = await api.get<BrandItem[]>("/brand-management/brands");
      setBrands(updatedBrands || []);
    } catch (err: any) {
      addLog(`Conversion failed: ${err.message}`, "info");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      <PageHeader
        title="Promoter Test Storefront"
        subtitle="Simulate Direction 1: Brand partners promoting Super Bae on their site, driving visitor clicks, signups, and subscription conversions."
        action={
          activeBrand ? (
            <Link
              href={`/brand/${activeBrand._id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--violet)] text-white px-4 py-2 text-sm font-semibold hover:bg-[#b03d82] transition-colors"
            >
              Open {activeBrand.name}&apos;s Profile ↗
            </Link>
          ) : null
        }
      />

      {/* Brand Selector Toolbar */}
      <Card className="p-4 bg-[var(--paper)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label htmlFor="brandSelect" className="text-sm font-semibold text-[var(--ink)]">
              Simulate As Partner Brand:
            </label>
            <select
              id="brandSelect"
              value={selectedBrandId}
              onChange={(e) => {
                setSelectedBrandId(e.target.value);
                setAttributionActive(false);
                setConversionSuccess(null);
              }}
              disabled={loadingBrands}
              className="input max-w-xs font-semibold"
            >
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} ({b.category})
                </option>
              ))}
            </select>
          </div>

          {activeBrand && (
            <div className="flex items-center gap-6 text-xs text-[var(--muted)]">
              <div>
                Total Live Clicks: <span className="font-mono font-bold text-[var(--ink)]">{activeBrand.clicks || 0}</span>
              </div>
              <div>
                Conversions: <span className="font-mono font-bold text-[var(--teal)]">{activeBrand.conversions || 0}</span>
              </div>
              <div>
                Revenue: <span className="font-mono font-bold text-[var(--ink)]">{inr(activeBrand.revenueGenerated || 0)}</span>
              </div>
              <div>
                Commission Earned:{" "}
                <span className="font-mono font-bold text-[var(--amber)]">{inr(activeBrand.commissionEarned || 0)}</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 2-Pane Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Step 1: External Brand Partner's Website */}
        <Card className="p-6 border-2 border-dashed border-[var(--violet)] space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--violet)]">Step 1 — External Website</span>
              <h3 className="font-display font-bold text-lg text-[var(--ink)]">
                {activeBrand?.name || "Partner"} Official Storefront
              </h3>
            </div>
            <span className="rounded-full bg-[var(--violet-dim)] text-[var(--violet)] px-2.5 py-1 text-xs font-bold">
              {activeBrand?.category || "Merchant"}
            </span>
          </div>

          <p className="text-sm text-[var(--muted)]">
            This represents the external partner&apos;s website or mobile app where they have placed a Super Bae campaign banner
            linking to their unique promoter tracking URL.
          </p>

          {/* Simulated Banner */}
          <div className="rounded-xl border border-[var(--violet)] bg-gradient-to-br from-[var(--paper)] to-[var(--violet-dim)]/40 p-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wide text-[var(--violet)]">Partner Promotion</div>
            <h4 className="font-display font-bold text-base text-[var(--ink)]">
              Special Collaboration: Experience Super Bae Premium
            </h4>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              As a valued customer of {activeBrand?.name}, unlock premier perks, lifestyle deals, and exclusive access with Super Bae.
            </p>

            <button
              onClick={handleSimulateVisitorClick}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--violet)] text-white px-4 py-2.5 text-sm font-bold hover:bg-[#b03d82] shadow-sm transition-all"
            >
              Visit Super Bae via Partner Link →
            </button>
          </div>

          <div className="rounded-lg bg-black/5 p-3 text-xs text-[var(--muted)] space-y-1">
            <div className="font-semibold text-[var(--ink)]">Promoter Tracking URL:</div>
            <code className="font-mono text-[11px] text-[var(--violet)] break-all select-all">
              http://localhost:4000/api/brand-management/track-promoter/{activeBrand?._id}
            </code>
          </div>
        </Card>

        {/* Step 2: Super Bae Customer Checkout & Conversion */}
        <Card className={`p-6 space-y-5 transition-all ${attributionActive ? "border-2 border-[var(--teal)]" : "opacity-80"}`}>
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--teal)]">Step 2 — Super Bae Checkout</span>
              <h3 className="font-display font-bold text-lg text-[var(--ink)]">Customer Signup & Subscription</h3>
            </div>
            {attributionActive ? (
              <span className="rounded-full bg-[var(--teal-dim)] text-[var(--teal)] px-2.5 py-1 text-xs font-bold flex items-center gap-1">
                ● Attribution Active
              </span>
            ) : (
              <span className="rounded-full bg-black/5 text-[var(--muted)] px-2.5 py-1 text-xs font-medium">
                Waiting for click
              </span>
            )}
          </div>

          {attributionActive ? (
            <div className="rounded-lg bg-[var(--teal-dim)] border border-[var(--teal)] p-3 text-xs text-[var(--teal)] font-medium">
              ✓ Visitor arrived via <strong>{activeBrand?.name}</strong>. Clicks recorded in real time:{" "}
              <strong>{clickCountSession}</strong>. Proceeding to checkout will credit <strong>fixed ₹500 commission</strong> to{" "}
              {activeBrand?.name}.
            </div>
          ) : (
            <div className="rounded-lg bg-black/5 p-3 text-xs text-[var(--muted)]">
              💡 Tip: Click the button in Step 1 first to simulate a visitor tapping the partner&apos;s promo link.
            </div>
          )}

          <form onSubmit={handleSubscribe} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] block mb-1">Customer Name</label>
                <input
                  className="input text-sm"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] block mb-1">Customer Email</label>
                <input
                  type="email"
                  className="input text-sm"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--muted)] block mb-1.5">Choose Subscription Plan</label>
              <div className="grid grid-cols-3 gap-2">
                {PLANS.map((p) => (
                  <button
                    type="button"
                    key={p.name}
                    onClick={() => setSelectedPlan(p)}
                    className={`rounded-lg border p-2.5 text-left transition-all ${
                      selectedPlan.name === p.name
                        ? "border-[var(--teal)] bg-[var(--teal-dim)]/40 shadow-sm"
                        : "border-[var(--line)] bg-[var(--paper)] hover:border-[var(--ink)]"
                    }`}
                  >
                    <div className="font-bold text-xs text-[var(--ink)]">{p.name}</div>
                    <div className="font-mono text-sm font-bold text-[var(--teal)] mt-0.5">{inr(p.price)}</div>
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={submitting || !activeBrand} className="w-full font-bold">
              {submitting ? "Processing Subscription..." : `Subscribe Now (${inr(selectedPlan.price)})`}
            </Button>
          </form>

          {conversionSuccess && (
            <div className="rounded-xl border border-[var(--teal)] bg-[var(--teal-dim)] p-4 space-y-2">
              <div className="font-bold text-sm text-[var(--teal)] flex items-center gap-1.5">
                ✓ Subscription & Conversion Completed!
              </div>
              <div className="text-xs text-[var(--ink)] space-y-1">
                <div>
                  <strong>Customer:</strong> {conversionSuccess.conversion.customerName} ({conversionSuccess.conversion.customerEmail})
                </div>
                <div>
                  <strong>Order Amount (GMV):</strong> {inr(conversionSuccess.conversion.orderAmount)}
                </div>
                <div>
                  <strong>Commission Credited to {activeBrand?.name}:</strong>{" "}
                  <span className="font-mono font-bold text-[var(--amber)]">
                    +{inr(conversionSuccess.conversion.commissionEarned)}
                  </span>{" "}
                  (Brand Partner Tier)
                </div>
              </div>
              <div className="pt-2 border-t border-[var(--teal)]/20">
                <Link
                  href={`/brand/${activeBrand?._id}`}
                  className="text-xs font-bold text-[var(--teal)] hover:underline inline-flex items-center gap-1"
                >
                  Verify updated metrics in {activeBrand?.name}&apos;s Profile →
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Live Event Console */}
      <Card className="p-5 space-y-3 bg-[#0a0a0a] text-white">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--teal)] animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-300">
              Live Real-Time Attribution Log
            </span>
          </div>
          {logs.length > 0 && (
            <button
              onClick={() => setLogs([])}
              className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Clear Log
            </button>
          )}
        </div>

        <div className="font-mono text-xs space-y-1.5 max-h-48 overflow-y-auto">
          {logs.length === 0 ? (
            <span className="text-neutral-500">Waiting for visitor clicks or subscription checkouts…</span>
          ) : (
            logs.map((l, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-neutral-500 text-[11px]">[{l.time}]</span>
                <span
                  className={
                    l.type === "success"
                      ? "text-[var(--teal)] font-semibold"
                      : l.type === "click"
                      ? "text-[var(--violet)]"
                      : "text-neutral-300"
                  }
                >
                  {l.msg}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

export default function BrandTestingStorefront() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[var(--muted)]">Loading storefront simulator...</div>}>
      <BrandTestingStorefrontContent />
    </Suspense>
  );
}
