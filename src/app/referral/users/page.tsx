"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { inr, num, dateShort } from "@/lib/format";
import { PageHeader, Card, KpiCard, Table, Th, Td, StatusBadge, Button, Loading, ErrorState } from "@/components/ui";

type UserReferralDetails = {
  userId: number;
  summary: {
    total: number;
    successful: number;
    pending: number;
    rejected: number;
    totalRewards: number;
  };
  referrals: Array<{
    _id: string;
    referrerId: number;
    referredUserId: number;
    referralCodeUsed: string;
    signedUpAt: string;
    verifiedAt?: string;
    convertedAt?: string;
    subscriptionType?: string;
    status: string;
  }>;
};

type ReferralCodeOwner = {
  id: number;
  code: string;
  owner: number;
  owner_name?: string;
  owner_email?: string;
  total_uses: number;
  successful_conversions: number;
};

export default function UserReferralDetailsPage() {
  const [userIdInput, setUserIdInput] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserReferralDetails | null>(null);
  const [owners, setOwners] = useState<ReferralCodeOwner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOwners = async () => {
    try {
      const res = await api.get<ReferralCodeOwner[]>("/admin/referral-codes/");
      setOwners(res || []);
    } catch {}
  };

  useEffect(() => {
    loadOwners();
  }, []);

  const handleLookup = async (idToSearch?: number) => {
    const uid = idToSearch || Number(userIdInput);
    if (!uid) return;

    try {
      setLoading(true);
      setError(null);
      const data = await api.get<UserReferralDetails>(`/admin/users/${uid}/referral-details`);
      setSelectedUser(data);
    } catch (err: any) {
      setError(err.message || "Failed to load user referral details");
      setSelectedUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Referral Details"
        subtitle="Drill-down user-level view of an advocate's referral network, invited users, and conversion timeline."
      />

      {/* User Search Bar */}
      <Card className="p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup();
          }}
          className="flex flex-wrap items-center gap-3"
        >
          <input
            className="input max-w-xs"
            placeholder="Enter User ID (e.g. 1, 2, 3)..."
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Lookup User"}
          </Button>

          {owners.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-[var(--muted)] ml-auto">
              <span>Quick Select:</span>
              <div className="flex flex-wrap gap-1.5">
                {owners.slice(0, 5).map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      setUserIdInput(String(o.owner));
                      handleLookup(o.owner);
                    }}
                    className="px-2.5 py-1 rounded-md bg-black/5 hover:bg-[var(--violet-dim)] text-[var(--ink)] font-semibold text-xs transition-colors"
                  >
                    User #{o.owner} ({o.owner_name || o.code})
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </Card>

      {error && <ErrorState message={error} />}

      {selectedUser && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <KpiCard
              label="Total Invited"
              value={num(selectedUser.summary.total)}
              hint="Referral instances"
              accent="violet"
            />
            <KpiCard
              label="Successful Conversions"
              value={num(selectedUser.summary.successful)}
              hint="Subscribed members"
              accent="teal"
            />
            <KpiCard
              label="Pending Referrals"
              value={num(selectedUser.summary.pending)}
              hint="In verification/trial"
              accent="amber"
            />
            <KpiCard
              label="Rejected / Expired"
              value={num(selectedUser.summary.rejected)}
              hint="Disqualified"
              accent="coral"
            />
            <KpiCard
              label="Total Rewards Earned"
              value={inr(selectedUser.summary.totalRewards)}
              hint="Paid to wallet"
              accent="teal"
            />
          </div>

          {/* Invited Friends & Lifecycle Table */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
              <div>
                <div className="font-display font-bold text-base text-[var(--ink)]">
                  Invited Users & Conversion Details
                </div>
                <p className="text-xs text-[var(--muted)]">All users who registered using User #{selectedUser.userId}&apos;s code</p>
              </div>
              <Link
                href="/referral/rewards"
                className="text-xs font-semibold text-[var(--violet)] hover:underline"
              >
                View Reward Ledger →
              </Link>
            </div>

            {selectedUser.referrals.length === 0 ? (
              <div className="py-12 text-center text-sm text-[var(--muted)]">
                No referrals recorded yet for User #{selectedUser.userId}.
              </div>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Referred User</Th>
                    <Th>Code Used</Th>
                    <Th>Registration Date</Th>
                    <Th>Verification Date</Th>
                    <Th>Converted Plan</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {selectedUser.referrals.map((r) => (
                    <tr key={r._id} className="hover:bg-black/5 transition-colors">
                      <Td className="font-mono font-bold text-[var(--ink)]">User #{r.referredUserId}</Td>
                      <Td className="font-mono font-bold text-[var(--violet)]">{r.referralCodeUsed}</Td>
                      <Td className="text-xs font-mono text-[var(--muted)]">{dateShort(r.signedUpAt)}</Td>
                      <Td className="text-xs font-mono text-[var(--muted)]">
                        {r.verifiedAt ? dateShort(r.verifiedAt) : "Pending"}
                      </Td>
                      <Td className="capitalize text-xs text-[var(--ink)]">
                        {r.subscriptionType || (r.status === "successful" ? "Pro Plan" : "—")}
                      </Td>
                      <Td>
                        <StatusBadge
                          status={
                            r.status === "successful"
                              ? "Converted"
                              : r.status === "pending"
                              ? "Pending"
                              : "Rejected"
                          }
                        />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
