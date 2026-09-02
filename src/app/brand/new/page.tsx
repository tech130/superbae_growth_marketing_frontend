"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { PageHeader, Card, Button, ErrorState } from "@/components/ui";

const categories = [
  "Fashion",
  "Beauty",
  "Wellness",
  "Travel",
  "Fitness",
  "Lifestyle",
  "Restaurants",
  "Experiences",
];

export default function AddBrandPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "Fashion",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    commissionArrangement: "fixed_500",
    commissionValue: 500,
    autoApprove: true,
    offerTitle: "",
    discountType: "percentage",
    discountValue: 20,
    couponCode: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankIfsc: "",
    gstNumber: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      setError("Brand name and contact email are required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await api.post("/brand-management/brands", {
        name: form.name,
        category: form.category,
        contactPerson: form.contactPerson,
        email: form.email,
        phone: form.phone,
        website: form.website,
        commissionArrangement: form.commissionArrangement,
        commissionValue: form.commissionValue,
        autoApprove: form.autoApprove,
        offerTitle: form.offerTitle,
        discountType: form.discountType,
        discountValue: form.discountValue,
        couponCode: form.couponCode,
        bankDetails: {
          accountName: form.bankAccountName,
          accountNumber: form.bankAccountNumber,
          ifsc: form.bankIfsc,
        },
        taxDetails: {
          gst: form.gstNumber,
        },
      });

      router.push("/brand");
    } catch (err: any) {
      setError(err.message || "Failed to onboard brand partner.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Onboard Brand Partner"
        subtitle="Register brand profile, commission terms, initial exclusive offer, and payout details."
        action={
          <Link
            href="/brand"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] px-4 py-2 text-sm font-medium hover:bg-[var(--violet-dim)] transition-colors"
          >
            ← Back to Directory
          </Link>
        }
      />

      {error && <ErrorState message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Brand Info */}
        <Card className="p-6 space-y-4">
          <div className="font-display font-bold text-lg text-[var(--ink)]">1. Brand Identity & Contacts</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium sm:col-span-2">
              Brand / Merchant Name *
              <input
                className="input mt-1.5"
                placeholder="e.g. Acme Lifestyle Co."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>

            <label className="text-sm font-medium">
              Industry Category *
              <select
                className="input mt-1.5"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium">
              Official Website URL
              <input
                className="input mt-1.5"
                placeholder="https://example.com"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </label>

            <label className="text-sm font-medium">
              Key Contact Person
              <input
                className="input mt-1.5"
                placeholder="Primary account manager name"
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
              />
            </label>

            <label className="text-sm font-medium">
              Official Email Address *
              <input
                className="input mt-1.5"
                type="email"
                placeholder="partnerships@brand.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
          </div>
        </Card>

        {/* Commission Terms */}
        <Card className="p-6 space-y-4">
          <div className="font-display font-bold text-lg text-[var(--ink)]">2. Commission & Commercial Terms</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Arrangement Type
              <select
                className="input mt-1.5"
                value={form.commissionArrangement}
                onChange={(e) => setForm({ ...form, commissionArrangement: e.target.value })}
              >
                <option value="fixed_500">Fixed Flat Fee (INR)</option>
                <option value="revshare_percentage">Revenue Share (%)</option>
              </select>
            </label>

            <label className="text-sm font-medium">
              Fee Value
              <input
                className="input mt-1.5"
                type="number"
                value={form.commissionValue}
                onChange={(e) => setForm({ ...form, commissionValue: Number(e.target.value) })}
              />
            </label>

            <div className="flex items-center gap-2 pt-2 sm:col-span-2">
              <input
                type="checkbox"
                id="autoApprove"
                className="accent-[var(--violet)]"
                checked={form.autoApprove}
                onChange={(e) => setForm({ ...form, autoApprove: e.target.checked })}
              />
              <label htmlFor="autoApprove" className="text-sm font-medium text-[var(--ink)] cursor-pointer">
                Approve and activate brand immediately (bypass verification queue)
              </label>
            </div>
          </div>
        </Card>

        {/* Initial Deal/Offer */}
        <Card className="p-6 space-y-4">
          <div className="font-display font-bold text-lg text-[var(--ink)]">3. Initial Exclusive Offer (Optional)</div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-medium sm:col-span-3">
              Offer Title
              <input
                className="input mt-1.5"
                placeholder="e.g. 20% Off All Online Orders"
                value={form.offerTitle}
                onChange={(e) => setForm({ ...form, offerTitle: e.target.value })}
              />
            </label>

            <label className="text-sm font-medium">
              Discount Type
              <select
                className="input mt-1.5"
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed INR</option>
              </select>
            </label>

            <label className="text-sm font-medium">
              Discount Amount
              <input
                className="input mt-1.5"
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
              />
            </label>

            <label className="text-sm font-medium">
              Coupon Code
              <input
                className="input mt-1.5"
                placeholder="e.g. ACME20"
                value={form.couponCode}
                onChange={(e) => setForm({ ...form, couponCode: e.target.value.toUpperCase() })}
              />
            </label>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Link
            href="/brand"
            className="inline-flex items-center rounded-lg border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--violet-dim)]"
          >
            Cancel
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? "Onboarding Brand..." : "Complete Onboarding"}
          </Button>
        </div>
      </form>
    </div>
  );
}
