"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Affiliate, SocialProfile } from "@/lib/types";
import { PageHeader, Card, Button } from "@/components/ui";

const CATEGORIES = ["Fashion", "Beauty", "Wellness", "Travel", "Fitness", "Lifestyle", "Restaurants", "Experiences"];
const PLATFORMS = ["Instagram", "YouTube", "TikTok", "Facebook", "X", "Other"];
const PAYMENT_METHODS = ["Bank Transfer", "UPI", "PayPal"];

const inputClass =
  "w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-white outline-none focus:ring-2 focus:ring-[var(--violet)]";
const labelClass = "block text-[11px] uppercase tracking-wide text-[var(--muted)] font-semibold mb-1.5";

interface ProfileDraft {
  platform: string;
  handle: string;
  followers: string;
}

export default function AddCreatorPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [profiles, setProfiles] = useState<ProfileDraft[]>([{ platform: PLATFORMS[0], handle: "", followers: "" }]);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [accountRef, setAccountRef] = useState("");
  const [taxInfo, setTaxInfo] = useState("");

  function updateProfile(i: number, patch: Partial<ProfileDraft>) {
    setProfiles((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addProfileRow() {
    setProfiles((rows) => [...rows, { platform: PLATFORMS[0], handle: "", followers: "" }]);
  }
  function removeProfileRow(i: number) {
    setProfiles((rows) => rows.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !category) {
      setError("Name, email and category are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const socialProfiles: Partial<SocialProfile>[] = profiles
        .filter((p) => p.handle.trim())
        .map((p) => ({
          platform: p.platform as SocialProfile["platform"],
          handle: p.handle.trim(),
          followers: Number(p.followers) || 0,
        }));

      const created = await api.post<Affiliate>("/creators", {
        name,
        email,
        phone: phone || undefined,
        category,
        socialProfiles,
        paymentDetails: accountRef ? { method: paymentMethod, accountRef } : undefined,
        taxInfo: taxInfo || undefined,
      });
      router.push(`/creators/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create creator");
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Add Creator"
        subtitle="New creators are created with status = Pending on the Premium Creator tier (30% of first subscription), then move to Creator Verification."
        action={
          <Link href="/creators">
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
              <label className={labelClass}>Creator name *</label>
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
              <label className={labelClass}>Phone</label>
              <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Category / niche *</label>
              <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Social profiles</label>
            <div className="space-y-2">
              {profiles.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    className={`${inputClass} w-36`}
                    value={p.platform}
                    onChange={(e) => updateProfile(i, { platform: e.target.value })}
                  >
                    {PLATFORMS.map((pl) => (
                      <option key={pl}>{pl}</option>
                    ))}
                  </select>
                  <input
                    className={inputClass}
                    placeholder="Handle, e.g. @ananya.style"
                    value={p.handle}
                    onChange={(e) => updateProfile(i, { handle: e.target.value })}
                  />
                  <input
                    type="number"
                    min={0}
                    className={`${inputClass} w-32`}
                    placeholder="Followers"
                    value={p.followers}
                    onChange={(e) => updateProfile(i, { followers: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => removeProfileRow(i)}
                    className="text-[var(--muted)] hover:text-[var(--coral)] px-1 text-sm"
                    aria-label="Remove profile"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addProfileRow} className="text-xs text-[var(--violet)] hover:underline mt-2">
              + Add another platform
            </button>
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
              {saving ? "Creating…" : "Create Creator"}
            </Button>
            <Link href="/creators">
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
