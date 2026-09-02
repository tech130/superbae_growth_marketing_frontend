"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { PageHeader, Card, Button, ErrorState } from "@/components/ui";

export default function CreatePromoCodePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: "",
    source: "campaign",
    discountType: "percentage",
    discountValue: 20,
    eligibility: "all",
    expiryDate: "",
    usageLimit: "",
    perUserLimit: 1,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) {
      setError("Promo code string is required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await api.post("/promo-management/codes", {
        ...form,
        code: form.code.trim().toUpperCase(),
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        expiryDate: form.expiryDate ? form.expiryDate : undefined,
      });

      router.push("/promo");
    } catch (err: any) {
      setError(err.message || "Failed to create promo code.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Create New Promo Code"
        subtitle="Generate discount codes with custom eligibility constraints, usage caps, and expiration dates."
        action={
          <Link
            href="/promo"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] px-4 py-2 text-sm font-medium hover:bg-[var(--violet-dim)] transition-colors"
          >
            ← Back to Directory
          </Link>
        }
      />

      {error && <ErrorState message={error} />}

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium sm:col-span-2">
              Promo Code String *
              <input
                className="input mt-1.5 font-mono uppercase font-bold"
                placeholder="e.g. FESTIVE50"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                required
              />
            </label>

            <label className="text-sm font-medium">
              Acquisition Source
              <select
                className="input mt-1.5"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
              >
                <option value="campaign">General Campaign</option>
                <option value="brand">Brand Partner</option>
                <option value="creator">Creator / Influencer</option>
                <option value="affiliate">Affiliate Partner</option>
                <option value="referral">Referral System</option>
                <option value="manual">Manual Admin Code</option>
              </select>
            </label>

            <label className="text-sm font-medium">
              Target Eligibility
              <select
                className="input mt-1.5"
                value={form.eligibility}
                onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
              >
                <option value="all">All Users</option>
                <option value="first_subscription">First Subscription Only</option>
                <option value="new_users">New Users Only</option>
                <option value="existing_users">Existing Users Only</option>
              </select>
            </label>

            <label className="text-sm font-medium">
              Discount Type
              <select
                className="input mt-1.5"
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed INR (₹)</option>
              </select>
            </label>

            <label className="text-sm font-medium">
              Discount Value
              <input
                className="input mt-1.5 font-mono"
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                required
              />
            </label>

            <label className="text-sm font-medium">
              Total Redemptions Cap (Optional)
              <input
                className="input mt-1.5"
                type="number"
                placeholder="Unlimited"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
              />
            </label>

            <label className="text-sm font-medium">
              Expiry Date (Optional)
              <input
                className="input mt-1.5"
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--line)]">
            <Link
              href="/promo"
              className="inline-flex items-center rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--violet-dim)]"
            >
              Cancel
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating Code..." : "Create Promo Code"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
