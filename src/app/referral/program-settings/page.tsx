"use client";

import { FormEvent, useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, Card, Button, Loading, ErrorState } from "@/components/ui";

type Settings = {
  id?: number;
  program_name?: string;
  description?: string;
  is_enabled?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  referral_link_base_url?: string;
  code_format?: string;
  new_users_only?: boolean;
  verified_users_only?: boolean;
  premium_users_only?: boolean;
  min_account_age_days?: number;
  exclude_suspended?: boolean;
  one_referral_per_new_user?: boolean;
  max_referrals_per_user?: number;
  max_rewards_per_user?: number;
  daily_referral_limit?: number;
  monthly_referral_limit?: number;
  reward_expiry_days?: number;
  referral_validity_days?: number;
  whatsapp_enabled?: boolean;
  instagram_enabled?: boolean;
  facebook_enabled?: boolean;
  copy_link_enabled?: boolean;
  qr_code_enabled?: boolean;
  email_enabled?: boolean;
  updated_at?: string;
};

export default function ProgramSettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.get<Settings>("/admin/referral-settings/");
      setSettings(data || {});
      setNotice(null);
    } catch (err: any) {
      setNotice({
        text: err.message || "Could not reach the API.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await api.put<Settings>("/admin/referral-settings/", settings);
      setSettings(updated);
      setNotice({ text: "Programme settings saved successfully.", type: "success" });
    } catch (err: any) {
      setNotice({
        text: err.message || "Failed to save settings.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading && Object.keys(settings).length === 0) return <Loading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Programme Settings"
        subtitle="Global referral configuration, anti-abuse validity limits, and enabled sharing channels."
        action={
          <Button variant="secondary" onClick={loadSettings}>
            Refresh
          </Button>
        }
      />

      {notice && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between ${
            notice.type === "success"
              ? "bg-[var(--teal-dim)] text-[var(--teal)] border border-[var(--teal)]"
              : "bg-[var(--coral-dim)] text-[var(--coral)] border border-[var(--coral)]"
          }`}
        >
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)} className="text-xs underline font-bold opacity-70">
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="grid gap-6 max-w-5xl">
        {/* General Identification */}
        <Card className="p-6 space-y-4">
          <div className="font-display font-bold text-lg text-[var(--ink)]">General Configuration</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium sm:col-span-2">
              Programme Name
              <input
                className="input mt-1.5"
                value={settings.program_name || ""}
                onChange={(e) => update("program_name", e.target.value)}
                placeholder="e.g. Super Bae Referrals"
              />
            </label>

            <label className="text-sm font-medium sm:col-span-2">
              Description
              <textarea
                className="input mt-1.5 min-h-20"
                value={settings.description || ""}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Explain the referral programme rules and terms..."
              />
            </label>

            <label className="text-sm font-medium sm:col-span-2">
              Referral Link Base URL
              <input
                className="input mt-1.5"
                value={settings.referral_link_base_url || ""}
                onChange={(e) => update("referral_link_base_url", e.target.value)}
                placeholder="http://localhost:3000/signup?ref="
              />
            </label>

            <label className="text-sm font-medium">
              Referral Code Format
              <input
                className="input mt-1.5"
                value={settings.code_format || ""}
                onChange={(e) => update("code_format", e.target.value)}
                placeholder="NAME + 4 digits"
              />
            </label>

            <div className="flex items-center gap-3 pt-6 sm:col-span-2">
              <input
                type="checkbox"
                id="is_enabled"
                className="h-4 w-4 rounded accent-[var(--violet)] cursor-pointer"
                checked={Boolean(settings.is_enabled)}
                onChange={(e) => update("is_enabled", e.target.checked)}
              />
              <label htmlFor="is_enabled" className="text-sm font-bold text-[var(--ink)] cursor-pointer">
                Referral programme actively enabled
              </label>
            </div>
          </div>
        </Card>

        {/* Limits & Validity */}
        <Card className="p-6 space-y-4">
          <div className="font-display font-bold text-lg text-[var(--ink)]">Limits & Validity</div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-medium">
              Referral Validity (Days)
              <input
                className="input mt-1.5"
                type="number"
                value={settings.referral_validity_days ?? 30}
                onChange={(e) => update("referral_validity_days", Number(e.target.value))}
              />
            </label>

            <label className="text-sm font-medium">
              Reward Expiry (Days)
              <input
                className="input mt-1.5"
                type="number"
                value={settings.reward_expiry_days ?? 90}
                onChange={(e) => update("reward_expiry_days", Number(e.target.value))}
              />
            </label>

            <label className="text-sm font-medium">
              Daily Referral Limit
              <input
                className="input mt-1.5"
                type="number"
                value={settings.daily_referral_limit ?? 20}
                onChange={(e) => update("daily_referral_limit", Number(e.target.value))}
              />
            </label>

            <label className="text-sm font-medium">
              Monthly Referral Limit
              <input
                className="input mt-1.5"
                type="number"
                value={settings.monthly_referral_limit ?? 100}
                onChange={(e) => update("monthly_referral_limit", Number(e.target.value))}
              />
            </label>

            <label className="text-sm font-medium">
              Max Referrals Per User
              <input
                className="input mt-1.5"
                type="number"
                value={settings.max_referrals_per_user ?? 100}
                onChange={(e) => update("max_referrals_per_user", Number(e.target.value))}
              />
            </label>

            <label className="text-sm font-medium">
              Max Rewards Per User
              <input
                className="input mt-1.5"
                type="number"
                value={settings.max_rewards_per_user ?? 100}
                onChange={(e) => update("max_rewards_per_user", Number(e.target.value))}
              />
            </label>
          </div>
        </Card>

        {/* User Eligibility */}
        <Card className="p-6 space-y-4">
          <div className="font-display font-bold text-lg text-[var(--ink)]">User Eligibility Conditions</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-[var(--ink)] cursor-pointer">
              <input
                type="checkbox"
                className="accent-[var(--violet)]"
                checked={Boolean(settings.one_referral_per_new_user)}
                onChange={(e) => update("one_referral_per_new_user", e.target.checked)}
              />
              One referral per new user
            </label>

            <label className="flex items-center gap-2 text-sm text-[var(--ink)] cursor-pointer">
              <input
                type="checkbox"
                className="accent-[var(--violet)]"
                checked={Boolean(settings.new_users_only)}
                onChange={(e) => update("new_users_only", e.target.checked)}
              />
              New users only
            </label>

            <label className="flex items-center gap-2 text-sm text-[var(--ink)] cursor-pointer">
              <input
                type="checkbox"
                className="accent-[var(--violet)]"
                checked={Boolean(settings.verified_users_only)}
                onChange={(e) => update("verified_users_only", e.target.checked)}
              />
              Verified accounts only
            </label>

            <label className="flex items-center gap-2 text-sm text-[var(--ink)] cursor-pointer">
              <input
                type="checkbox"
                className="accent-[var(--violet)]"
                checked={Boolean(settings.exclude_suspended)}
                onChange={(e) => update("exclude_suspended", e.target.checked)}
              />
              Exclude suspended accounts
            </label>
          </div>
        </Card>

        {/* Sharing Channels */}
        <Card className="p-6 space-y-4">
          <div className="font-display font-bold text-lg text-[var(--ink)]">Enabled Sharing Channels</div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex items-center gap-2 text-sm text-[var(--ink)] cursor-pointer">
              <input
                type="checkbox"
                className="accent-[var(--violet)]"
                checked={Boolean(settings.copy_link_enabled)}
                onChange={(e) => update("copy_link_enabled", e.target.checked)}
              />
              Copy Link
            </label>

            <label className="flex items-center gap-2 text-sm text-[var(--ink)] cursor-pointer">
              <input
                type="checkbox"
                className="accent-[var(--violet)]"
                checked={Boolean(settings.qr_code_enabled)}
                onChange={(e) => update("qr_code_enabled", e.target.checked)}
              />
              QR Code
            </label>

            <label className="flex items-center gap-2 text-sm text-[var(--ink)] cursor-pointer">
              <input
                type="checkbox"
                className="accent-[var(--violet)]"
                checked={Boolean(settings.whatsapp_enabled)}
                onChange={(e) => update("whatsapp_enabled", e.target.checked)}
              />
              WhatsApp
            </label>

            <label className="flex items-center gap-2 text-sm text-[var(--ink)] cursor-pointer">
              <input
                type="checkbox"
                className="accent-[var(--violet)]"
                checked={Boolean(settings.instagram_enabled)}
                onChange={(e) => update("instagram_enabled", e.target.checked)}
              />
              Instagram
            </label>

            <label className="flex items-center gap-2 text-sm text-[var(--ink)] cursor-pointer">
              <input
                type="checkbox"
                className="accent-[var(--violet)]"
                checked={Boolean(settings.facebook_enabled)}
                onChange={(e) => update("facebook_enabled", e.target.checked)}
              />
              Facebook
            </label>

            <label className="flex items-center gap-2 text-sm text-[var(--ink)] cursor-pointer">
              <input
                type="checkbox"
                className="accent-[var(--violet)]"
                checked={Boolean(settings.email_enabled)}
                onChange={(e) => update("email_enabled", e.target.checked)}
              />
              Email
            </label>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving changes..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
