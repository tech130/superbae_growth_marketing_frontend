"use client";

import { FormEvent, useEffect, useState } from "react";
import api from "@/lib/api";
import { inr, dateShort } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, ErrorState } from "@/components/ui";

type TriggerType = "signup" | "verification" | "first_subscription" | "premium_subscription";
type RewardTypeOption = "cash" | "points" | "coupon" | "subscription_credit";
type RuleStatus = "active" | "inactive";

type ReferralRule = {
  id: number;
  name: string;
  trigger: TriggerType;
  reward_type: RewardTypeOption;
  reward_amount: string | number;
  limit_per_user?: number | null;
  status: RuleStatus;
  created_at: string;
};

export default function ReferralRulesPage() {
  const [rules, setRules] = useState<ReferralRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [newRule, setNewRule] = useState<{
    name: string;
    trigger: TriggerType;
    reward_type: RewardTypeOption;
    reward_amount: number;
    limit_per_user: string;
    status: RuleStatus;
  }>({
    name: "",
    trigger: "first_subscription",
    reward_type: "cash",
    reward_amount: 100,
    limit_per_user: "",
    status: "active",
  });

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await api.djangoGet<ReferralRule[]>("/admin/referral-rules/");
      setRules(data || []);
      setNotice(null);
    } catch (err: any) {
      setNotice({
        text: err.message || "Could not fetch referral rules from Django API.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!newRule.name.trim()) {
      setNotice({ text: "Rule name is required.", type: "error" });
      return;
    }
    try {
      await api.djangoPost("/admin/referral-rules/", {
        ...newRule,
        limit_per_user: newRule.limit_per_user ? Number(newRule.limit_per_user) : null,
      });
      setNotice({ text: "Referral rule created successfully.", type: "success" });
      setNewRule({
        name: "",
        trigger: "first_subscription",
        reward_type: "cash",
        reward_amount: 100,
        limit_per_user: "",
        status: "active",
      });
      setShowForm(false);
      await loadRules();
    } catch (err: any) {
      setNotice({ text: err.message || "Failed to create rule.", type: "error" });
    }
  };

  const handleToggleStatus = async (rule: ReferralRule) => {
    const nextStatus = rule.status === "active" ? "inactive" : "active";
    try {
      await api.djangoPatch(`/admin/referral-rules/${rule.id}/status/`, { status: nextStatus });
      setNotice({ text: `Rule set to ${nextStatus}.`, type: "success" });
      await loadRules();
    } catch (err: any) {
      setNotice({ text: err.message || "Failed to update rule status.", type: "error" });
    }
  };

  const handleDuplicate = async (ruleId: number) => {
    try {
      await api.djangoPost(`/admin/referral-rules/${ruleId}/duplicate/`);
      setNotice({ text: "Rule duplicated successfully.", type: "success" });
      await loadRules();
    } catch (err: any) {
      setNotice({ text: err.message || "Failed to duplicate rule.", type: "error" });
    }
  };

  const handleDelete = async (ruleId: number) => {
    if (!confirm("Are you sure you want to delete this referral rule?")) return;
    try {
      await api.djangoDelete(`/admin/referral-rules/${ruleId}/`);
      setNotice({ text: "Rule deleted successfully.", type: "success" });
      await loadRules();
    } catch (err: any) {
      setNotice({ text: err.message || "Failed to delete rule.", type: "error" });
    }
  };

  const formatTrigger = (t: string) => {
    switch (t) {
      case "first_subscription":
        return "First Subscription";
      case "premium_subscription":
        return "Premium Subscription";
      case "verification":
        return "Account Verification";
      case "signup":
        return "User Signup";
      default:
        return t;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referral Rules"
        subtitle="Configure reward triggers, incentive amounts, and per-user attribution limits."
        action={
          <div className="flex gap-2">
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "+ New Rule"}
            </Button>
            <Button variant="secondary" onClick={loadRules}>
              Refresh
            </Button>
          </div>
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

      {showForm && (
        <Card className="p-6 border-[var(--violet)] space-y-4 max-w-4xl">
          <div className="font-display font-bold text-lg text-[var(--ink)]">Create Referral Rule</div>
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-medium sm:col-span-2 lg:col-span-3">
              Rule Name
              <input
                className="input mt-1.5"
                placeholder="e.g. Standard 1st Subscription Reward"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              />
            </label>

            <label className="text-sm font-medium">
              Trigger Event
              <select
                className="input mt-1.5"
                value={newRule.trigger}
                onChange={(e) => setNewRule({ ...newRule, trigger: e.target.value as TriggerType })}
              >
                <option value="first_subscription">First Subscription</option>
                <option value="signup">Signup</option>
                <option value="verification">Verification</option>
                <option value="premium_subscription">Premium Subscription</option>
              </select>
            </label>

            <label className="text-sm font-medium">
              Reward Type
              <select
                className="input mt-1.5"
                value={newRule.reward_type}
                onChange={(e) => setNewRule({ ...newRule, reward_type: e.target.value as RewardTypeOption })}
              >
                <option value="cash">Cash (INR)</option>
                <option value="points">Points</option>
                <option value="coupon">Coupon</option>
                <option value="subscription_credit">Subscription Credit</option>
              </select>
            </label>

            <label className="text-sm font-medium">
              Reward Amount
              <input
                className="input mt-1.5"
                type="number"
                value={newRule.reward_amount}
                onChange={(e) => setNewRule({ ...newRule, reward_amount: Number(e.target.value) })}
              />
            </label>

            <label className="text-sm font-medium">
              Limit Per User (Optional)
              <input
                className="input mt-1.5"
                type="number"
                placeholder="Unlimited"
                value={newRule.limit_per_user}
                onChange={(e) => setNewRule({ ...newRule, limit_per_user: e.target.value })}
              />
            </label>

            <label className="text-sm font-medium">
              Initial Status
              <select
                className="input mt-1.5"
                value={newRule.status}
                onChange={(e) => setNewRule({ ...newRule, status: e.target.value as RuleStatus })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            <div className="flex items-end sm:col-span-2 lg:col-span-3 pt-2">
              <Button type="submit">Save Rule</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        {loading && rules.length === 0 ? (
          <Loading />
        ) : rules.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">
            No referral rules configured yet. Click &quot;+ New Rule&quot; to add one.
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Rule Name</Th>
                <Th>Trigger Event</Th>
                <Th>Reward Value</Th>
                <Th>Per User Limit</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-black/5 transition-colors">
                  <Td className="font-semibold text-[var(--ink)]">{rule.name}</Td>
                  <Td>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-[var(--violet-dim)] text-[var(--violet)]">
                      {formatTrigger(rule.trigger)}
                    </span>
                  </Td>
                  <Td className="font-mono font-bold text-[var(--ink)]">
                    {rule.reward_type === "cash" ? inr(Number(rule.reward_amount)) : `${rule.reward_amount} (${rule.reward_type})`}
                  </Td>
                  <Td className="text-[var(--muted)]">
                    {rule.limit_per_user ? `${rule.limit_per_user} uses` : "Unlimited"}
                  </Td>
                  <Td>
                    <StatusBadge status={rule.status === "active" ? "Active" : "Disabled"} />
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-3 text-xs font-semibold">
                      <button
                        onClick={() => handleToggleStatus(rule)}
                        className={`hover:underline ${rule.status === "active" ? "text-[var(--amber)]" : "text-[var(--teal)]"}`}
                      >
                        {rule.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDuplicate(rule.id)}
                        className="text-[var(--muted)] hover:text-[var(--ink)]"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="text-[var(--coral)] hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
