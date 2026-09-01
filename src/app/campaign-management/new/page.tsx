"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Affiliate, CampaignRecord, CampaignSourceType } from "@/lib/types";
import { num } from "@/lib/format";
import { PageHeader, Card, Button } from "@/components/ui";

const SOURCE_TYPES: CampaignSourceType[] = ["Referral", "Affiliate", "Influencer", "Promo", "Coupon"];
const CATEGORIES = ["Fashion", "Beauty", "Wellness", "Travel", "Fitness", "Lifestyle", "Restaurants", "Experiences"];
const NEW_VS_EXISTING = ["Both", "New Users", "Existing Users"];
const PLATFORMS = ["Both", "iOS", "Android"];

const inputClass =
  "w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-white outline-none focus:ring-2 focus:ring-[var(--violet)]";
const labelClass = "block text-[11px] uppercase tracking-wide text-[var(--muted)] font-semibold mb-1.5";

export default function CreateCampaignPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [sourceType, setSourceType] = useState<CampaignSourceType>("Referral");
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [creators, setCreators] = useState<Affiliate[]>([]);
  const [linkedRefId, setLinkedRefId] = useState("");
  const [linkedRefLabel, setLinkedRefLabel] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [landingPage, setLandingPage] = useState("");
  const [autoPause, setAutoPause] = useState(false);

  const [newVsExisting, setNewVsExisting] = useState(NEW_VS_EXISTING[0]);
  const [geography, setGeography] = useState("India");
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [ageRange, setAgeRange] = useState("");
  const [estimate, setEstimate] = useState<number | null>(null);

  useEffect(() => {
    api.get<Affiliate[]>("/affiliates?status=Active").then(setAffiliates).catch(() => {});
    api.get<Affiliate[]>("/creators?status=Active").then(setCreators).catch(() => {});
  }, []);

  async function previewReach() {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (platform !== "Both") params.set("platform", platform);
    const r = await api.get<{ estimatedReach: number }>(`/campaign-management/audience/estimate?${params.toString()}`);
    setEstimate(r.estimatedReach);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) {
      setError("Campaign name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await api.post<CampaignRecord>("/campaign-management", {
        name,
        sourceType,
        linkedRefId: sourceType === "Affiliate" || sourceType === "Influencer" ? linkedRefId || undefined : undefined,
        linkedRefLabel: sourceType === "Referral" || sourceType === "Promo" || sourceType === "Coupon" ? linkedRefLabel || undefined : undefined,
        category,
        audience: {
          category,
          newVsExisting,
          geography: geography || undefined,
          platform,
          ageRange: ageRange || undefined,
        },
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        budget: budget ? Number(budget) : undefined,
        landingPage: landingPage || undefined,
        autoPauseOnBudgetExhausted: autoPause,
      });
      router.push(`/campaign-management/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create campaign");
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Create Campaign"
        subtitle="Standardize how a new campaign is set up, regardless of which acquisition channel it uses."
        action={
          <Link href="/campaign-management">
            <Button variant="secondary">Cancel</Button>
          </Link>
        }
      />

      <Card className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="py-2.5 px-3 bg-[var(--coral-dim)] text-[var(--coral)] rounded-lg text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Campaign name *</label>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className={labelClass}>Source type *</label>
              <select className={inputClass} value={sourceType} onChange={(e) => setSourceType(e.target.value as CampaignSourceType)}>
                {SOURCE_TYPES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {sourceType === "Affiliate" && (
            <div>
              <label className={labelClass}>Linked affiliate</label>
              <select className={inputClass} value={linkedRefId} onChange={(e) => setLinkedRefId(e.target.value)}>
                <option value="">— none —</option>
                {affiliates.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {sourceType === "Influencer" && (
            <div>
              <label className={labelClass}>Linked creator</label>
              <select className={inputClass} value={linkedRefId} onChange={(e) => setLinkedRefId(e.target.value)}>
                <option value="">— none —</option>
                {creators.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {sourceType === "Referral" && (
            <div>
              <label className={labelClass}>Linked referral rule</label>
              <input
                className={inputClass}
                value={linkedRefLabel}
                onChange={(e) => setLinkedRefLabel(e.target.value)}
                placeholder="e.g. Double Reward Weekend"
              />
            </div>
          )}
          {sourceType === "Promo" && (
            <div>
              <label className={labelClass}>Linked promo code</label>
              <input
                className={inputClass}
                value={linkedRefLabel}
                onChange={(e) => setLinkedRefLabel(e.target.value)}
                placeholder="e.g. WELCOME50"
              />
            </div>
          )}
          {sourceType === "Coupon" && (
            <div>
              <label className={labelClass}>Linked brand / coupon</label>
              <input
                className={inputClass}
                value={linkedRefLabel}
                onChange={(e) => setLinkedRefLabel(e.target.value)}
                placeholder="e.g. StyleHub — STYLEHUB20"
              />
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Start date</label>
              <input type="date" className={inputClass} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>End date</label>
              <input type="date" className={inputClass} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Budget (₹)</label>
              <input type="number" min={0} className={inputClass} value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Landing page / deep link</label>
              <input className={inputClass} value={landingPage} onChange={(e) => setLandingPage(e.target.value)} placeholder="https://…" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <input type="checkbox" checked={autoPause} onChange={(e) => setAutoPause(e.target.checked)} />
            Auto-pause when budget is exhausted
          </label>

          <div className="pt-3 border-t border-[var(--line)]">
            <label className={labelClass}>Audience</label>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <div className="text-[11px] text-[var(--muted)] mb-1">New vs existing</div>
                <select className={inputClass} value={newVsExisting} onChange={(e) => setNewVsExisting(e.target.value)}>
                  {NEW_VS_EXISTING.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-[11px] text-[var(--muted)] mb-1">Platform</div>
                <select className={inputClass} value={platform} onChange={(e) => setPlatform(e.target.value)}>
                  {PLATFORMS.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-[11px] text-[var(--muted)] mb-1">Age range</div>
                <input className={inputClass} value={ageRange} onChange={(e) => setAgeRange(e.target.value)} placeholder="e.g. 18-34" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                className={`${inputClass} w-56`}
                value={geography}
                onChange={(e) => setGeography(e.target.value)}
                placeholder="Geography / country"
              />
              <Button type="button" variant="secondary" onClick={previewReach}>
                Preview estimated reach
              </Button>
              {estimate !== null && <span className="text-sm text-[var(--muted)]">≈ {num(estimate)} people</span>}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Creating…" : "Create Campaign"}
            </Button>
            <Link href="/campaign-management">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
