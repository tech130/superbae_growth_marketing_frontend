"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { num } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, ErrorState } from "@/components/ui";

type ReferralCodeItem = {
  id: number;
  code: string;
  owner: number;
  owner_name: string;
  owner_email: string;
  created_at: string;
  expires_at?: string | null;
  total_uses: number;
  successful_conversions: number;
  status: "active" | "expired" | "disabled" | "suspended";
};

export default function ReferralCodesPage() {
  const [codes, setCodes] = useState<ReferralCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [notice, setNotice] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const loadCodes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter) params.append("status", statusFilter);
      const qs = params.toString() ? `?${params.toString()}` : "";
      const data = await api.get<ReferralCodeItem[]>(`/admin/referral-codes/${qs}`);
      setCodes(data || []);
      setNotice(null);
    } catch (err: any) {
      setNotice({
        text: err.message || "Could not load referral codes.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCodes();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadCodes]);

  const handleToggleStatus = async (codeItem: ReferralCodeItem) => {
    const nextAction = codeItem.status === "active" ? "disable" : "enable";
    try {
      await api.patch(`/admin/referral-codes/${codeItem.id}/${nextAction}/`);
      setNotice({ text: `Code ${codeItem.code} set to ${nextAction}d.`, type: "success" });
      await loadCodes();
    } catch (err: any) {
      setNotice({ text: err.message || "Failed to update code.", type: "error" });
    }
  };

  const handleRegenerate = async (codeId: number) => {
    if (!confirm("Regenerating this code will invalidate the old code and update associated links. Proceed?")) return;
    try {
      const updated = await api.post<ReferralCodeItem>(`/admin/referral-codes/${codeId}/regenerate/`);
      setNotice({ text: `New code generated: ${updated.code}`, type: "success" });
      await loadCodes();
    } catch (err: any) {
      setNotice({ text: err.message || "Failed to regenerate code.", type: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referral Codes"
        subtitle="Live registry of individual user referral codes, attribution usage, and lifecycle states."
        action={
          <Button variant="secondary" onClick={loadCodes}>
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

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="input max-w-xs"
          placeholder="Search by code or user email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input max-w-44"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
          <option value="expired">Expired</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <Card className="overflow-hidden">
        {loading && codes.length === 0 ? (
          <Loading />
        ) : codes.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">
            No referral codes found matching the filter criteria.
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Referral Code</Th>
                <Th>Owner / User</Th>
                <Th>Total Uses</Th>
                <Th>Conversions</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {codes.map((item) => (
                <tr key={item.id} className="hover:bg-black/5 transition-colors">
                  <Td className="font-mono font-bold text-[var(--violet)]">{item.code}</Td>
                  <Td>
                    <p className="font-semibold text-[var(--ink)]">{item.owner_name || "Anonymous User"}</p>
                    <p className="text-xs text-[var(--muted)] font-mono">{item.owner_email}</p>
                  </Td>
                  <Td className="font-mono text-[var(--muted)]">{num(item.total_uses)}</Td>
                  <Td className="font-mono font-bold text-[var(--teal)]">{num(item.successful_conversions)}</Td>
                  <Td>
                    <StatusBadge status={item.status === "active" ? "Active" : item.status === "expired" ? "Expired" : "Disabled"} />
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-3 text-xs font-semibold">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`hover:underline ${item.status === "active" ? "text-[var(--amber)]" : "text-[var(--teal)]"}`}
                      >
                        {item.status === "active" ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => handleRegenerate(item.id)}
                        className="text-[var(--violet)] hover:underline"
                      >
                        Regenerate
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
