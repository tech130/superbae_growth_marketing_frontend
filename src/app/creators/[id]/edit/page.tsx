"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Affiliate } from "@/lib/types";
import { PageHeader, Card, Button, Loading, ErrorState } from "@/components/ui";

const CATEGORIES = ["Fashion", "Beauty", "Wellness", "Travel", "Fitness", "Lifestyle", "Restaurants", "Experiences"];
const PAYMENT_METHODS = ["Bank Transfer", "UPI", "PayPal"];

const inputClass =
  "w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-white outline-none focus:ring-2 focus:ring-[var(--violet)]";
const labelClass = "block text-[11px] uppercase tracking-wide text-[var(--muted)] font-semibold mb-1.5";

export default function EditCreatorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [cookieWindowDays, setCookieWindowDays] = useState(30);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [accountRef, setAccountRef] = useState("");
  const [taxInfo, setTaxInfo] = useState("");

  useEffect(() => {
    api
      .get<Affiliate>(`/creators/${id}`)
      .then((a) => {
        setName(a.name);
        setEmail(a.email);
        setPhone(a.phone || "");
        setCategory(a.category);
        setCookieWindowDays(a.cookieWindowDays);
        setPaymentMethod(a.paymentDetails?.method || PAYMENT_METHODS[0]);
        setAccountRef(a.paymentDetails?.accountRef || "");
        setTaxInfo(a.taxInfo || "");
        setLoaded(true);
      })
      .catch((e) => setLoadError(e.message));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !category) {
      setError("Name, email and category are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.patch(`/creators/${id}`, {
        name,
        email,
        phone: phone || undefined,
        category,
        cookieWindowDays: Number(cookieWindowDays) || 30,
        paymentDetails: accountRef ? { method: paymentMethod, accountRef } : undefined,
        taxInfo: taxInfo || undefined,
      });
      router.push(`/creators/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update creator");
      setSaving(false);
    }
  }

  if (loadError) return <ErrorState message={loadError} />;
  if (!loaded) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Edit Creator"
        subtitle={`Editing ${name}. Social profiles are managed from the creator's profile page.`}
        action={
          <Link href={`/creators/${id}`}>
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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Phone</label>
              <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Category *</label>
              <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
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
              {saving ? "Saving…" : "Save changes"}
            </Button>
            <Link href={`/creators/${id}`}>
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
