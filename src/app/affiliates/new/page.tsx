"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Affiliate } from "@/lib/types";
import { PageHeader, Card, Button } from "@/components/ui";

const CATEGORIES = [
  "Fashion",
  "Beauty",
  "Wellness",
  "Travel",
  "Fitness",
  "Lifestyle",
  "Restaurants",
  "Experiences",
];

const TIERS = ["Standard", "Premium Creator", "Brand Partner"];
const PAYMENT_METHODS = ["Bank Transfer", "UPI", "PayPal"];

const inputClass =
  "w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-white outline-none focus:ring-2 focus:ring-[var(--violet)]";
const labelClass = "block text-[11px] uppercase tracking-wide text-[var(--muted)] font-semibold mb-1.5";

export default function AddAffiliatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [socials, setSocials] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tier, setTier] = useState(TIERS[0]);
  const [cookieWindowDays, setCookieWindowDays] = useState(30);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [accountRef, setAccountRef] = useState("");
  const [taxInfo, setTaxInfo] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !category) {
      setError("Name, email and category are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await api.post<Affiliate>("/affiliates", {
        name,
        email,
        company: company || undefined,
        phone: phone || undefined,
        website: website || undefined,
        category,
        socials: socials
          ? socials.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        tier,
        cookieWindowDays: Number(cookieWindowDays) || 30,
        paymentDetails: accountRef ? { method: paymentMethod, accountRef } : undefined,
        taxInfo: taxInfo || undefined,
      });
      router.push(`/affiliates/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create affiliate");
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Add Affiliate"
        subtitle="New affiliates are created with status = Pending and default commission terms for their tier, then move to Approvals."
        action={
          <Link href="/affiliates">
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
              <label className={labelClass}>Name *</label>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Company / Brand</label>
              <input className={inputClass} value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Website</label>
              <input
                className={inputClass}
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div>
              <label className={labelClass}>Social accounts</label>
              <input
                className={inputClass}
                value={socials}
                onChange={(e) => setSocials(e.target.value)}
                placeholder="instagram.com/handle, youtube.com/@handle"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Category *</label>
              <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Tier</label>
              <select className={inputClass} value={tier} onChange={(e) => setTier(e.target.value)}>
                {TIERS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Cookie window (days)</label>
              <input
                type="number"
                min={1}
                className={inputClass}
                value={cookieWindowDays}
                onChange={(e) => setCookieWindowDays(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Payment method</label>
              <select className={inputClass} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Account reference</label>
              <input
                className={inputClass}
                value={accountRef}
                onChange={(e) => setAccountRef(e.target.value)}
                placeholder="Bank a/c, UPI ID, or PayPal email"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Tax info</label>
            <input className={inputClass} value={taxInfo} onChange={(e) => setTaxInfo(e.target.value)} placeholder="PAN, GSTIN, etc." />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Creating…" : "Create Affiliate"}
            </Button>
            <Link href="/affiliates">
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
