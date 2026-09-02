"use client";

import { FormEvent, useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, Card, Button, StatusBadge, Loading, ErrorState } from "@/components/ui";

type RewardTypeKey = "cash" | "points" | "coupon" | "subscription_credit";

type RewardType = {
  id: number;
  key: RewardTypeKey;
  label: string;
  conversion_value?: string | number | null;
  is_active: boolean;
};

type PointsConfig = {
  id?: number;
  earn_rate?: string | number;
  redemption_rate?: string | number;
  expiry_days?: number;
};

export default function ReferralTypesPage() {
  const [types, setTypes] = useState<RewardType[]>([]);
  const [pointsConfig, setPointsConfig] = useState<PointsConfig>({
    earn_rate: 1,
    redemption_rate: 1,
    expiry_days: 90,
  });
  const [loading, setLoading] = useState(true);
  const [savingPoints, setSavingPoints] = useState(false);
  const [notice, setNotice] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [newType, setNewType] = useState<{
    key: RewardTypeKey;
    label: string;
    conversion_value: number;
    is_active: boolean;
  }>({
    key: "points",
    label: "Points",
    conversion_value: 1,
    is_active: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [typesData, configData] = await Promise.all([
        api.djangoGet<RewardType[]>("/admin/reward-types/"),
        api.djangoGet<PointsConfig>("/admin/points-config/").catch(() => null),
      ]);
      setTypes(typesData || []);
      if (configData) setPointsConfig(configData);
      setNotice(null);
    } catch (err: any) {
      setNotice({
        text: err.message || "Could not fetch reward types.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateType = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.djangoPost("/admin/reward-types/", newType);
      setNotice({ text: "Reward type created successfully.", type: "success" });
      await loadData();
    } catch (err: any) {
      setNotice({ text: err.message || "Failed to add reward type.", type: "error" });
    }
  };

  const handleToggleActive = async (typeItem: RewardType) => {
    try {
      await api.djangoPut("/admin/reward-types/", {
        id: typeItem.id,
        is_active: !typeItem.is_active,
      });
      setNotice({ text: `Reward type "${typeItem.label}" updated.`, type: "success" });
      await loadData();
    } catch (err: any) {
      setNotice({ text: err.message || "Failed to update reward type.", type: "error" });
    }
  };

  const handleSavePoints = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSavingPoints(true);
      const updated = await api.djangoPut<PointsConfig>("/admin/points-config/", pointsConfig);
      setPointsConfig(updated);
      setNotice({ text: "Points configuration updated successfully.", type: "success" });
    } catch (err: any) {
      setNotice({ text: err.message || "Failed to save points config.", type: "error" });
    } finally {
      setSavingPoints(false);
    }
  };

  if (loading && types.length === 0) return <Loading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reward & Incentive Types"
        subtitle="Manage reward currencies, exchange rates, and points economics."
        action={
          <Button variant="secondary" onClick={loadData}>
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

      <div className="grid gap-6 lg:grid-cols-2 max-w-6xl">
        {/* Reward Types Directory & Creator */}
        <Card className="p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="font-display font-bold text-lg text-[var(--ink)]">Configured Reward Types</div>
            <p className="text-xs text-[var(--muted)]">Active modalities available for referral campaign payouts.</p>

            <div className="space-y-3">
              {types.length === 0 ? (
                <p className="text-xs text-[var(--muted)] py-4 text-center">No reward types configured.</p>
              ) : (
                types.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--line)] bg-[var(--paper)]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[var(--ink)]">{t.label}</span>
                        <span className="font-mono text-xs text-[var(--muted)]">({t.key})</span>
                      </div>
                      <p className="text-xs text-[var(--muted)] mt-0.5">
                        Conversion: {t.conversion_value ? `1 unit = ₹${t.conversion_value}` : "Direct Currency"}
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleActive(t)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                        t.is_active
                          ? "bg-[var(--teal-dim)] text-[var(--teal)] hover:opacity-80"
                          : "bg-black/5 text-[var(--muted)] hover:bg-black/10"
                      }`}
                    >
                      {t.is_active ? "Active" : "Disabled"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <form onSubmit={handleCreateType} className="border-t border-[var(--line)] pt-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Add Reward Type</div>
            <div className="flex flex-wrap gap-2">
              <select
                className="input flex-1 min-w-32"
                value={newType.key}
                onChange={(e) => {
                  const k = e.target.value as RewardTypeKey;
                  setNewType({
                    ...newType,
                    key: k,
                    label: k.charAt(0).toUpperCase() + k.slice(1).replace("_", " "),
                  });
                }}
              >
                <option value="points">Points</option>
                <option value="coupon">Coupon</option>
                <option value="subscription_credit">Subscription Credit</option>
                <option value="cash">Cash</option>
              </select>

              <input
                className="input w-28"
                type="number"
                placeholder="Conversion"
                value={newType.conversion_value}
                onChange={(e) => setNewType({ ...newType, conversion_value: Number(e.target.value) })}
              />

              <Button type="submit">Add</Button>
            </div>
          </form>
        </Card>

        {/* Points System Economics */}
        <Card className="p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="font-display font-bold text-lg text-[var(--ink)]">Points System Economics</div>
            <p className="text-xs text-[var(--muted)]">Global point calculation multipliers and lifespan durations.</p>

            <form onSubmit={handleSavePoints} className="space-y-4">
              <label className="block text-sm font-medium">
                Earn Rate Multiplier
                <span className="block text-xs text-[var(--muted)] font-normal mt-0.5">Points awarded per ₹1 spent / referred.</span>
                <input
                  className="input mt-1.5"
                  type="number"
                  step="0.01"
                  value={pointsConfig.earn_rate ?? 1}
                  onChange={(e) => setPointsConfig({ ...pointsConfig, earn_rate: e.target.value })}
                />
              </label>

              <label className="block text-sm font-medium">
                Redemption Rate Multiplier
                <span className="block text-xs text-[var(--muted)] font-normal mt-0.5">Rupee value per 1 point at checkout.</span>
                <input
                  className="input mt-1.5"
                  type="number"
                  step="0.01"
                  value={pointsConfig.redemption_rate ?? 1}
                  onChange={(e) => setPointsConfig({ ...pointsConfig, redemption_rate: e.target.value })}
                />
              </label>

              <label className="block text-sm font-medium">
                Points Expiry (Days)
                <span className="block text-xs text-[var(--muted)] font-normal mt-0.5">Number of days before unredeemed points expire.</span>
                <input
                  className="input mt-1.5"
                  type="number"
                  value={pointsConfig.expiry_days ?? 90}
                  onChange={(e) => setPointsConfig({ ...pointsConfig, expiry_days: Number(e.target.value) })}
                />
              </label>

              <div className="pt-2">
                <Button type="submit" disabled={savingPoints}>
                  {savingPoints ? "Saving..." : "Save Points Config"}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
