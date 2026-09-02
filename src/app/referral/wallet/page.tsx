"use client";

import { FormEvent, useState } from "react";
import api from "@/lib/api";
import { inr, dateShort } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, Button, Loading, ErrorState } from "@/components/ui";

type WalletData = {
  balance: number;
  transactions: Array<{
    _id: string;
    type: "credit" | "debit";
    amount: number;
    reason?: string;
    balanceAfter?: number;
    createdAt: string;
  }>;
};

export default function WalletLookupPage() {
  const [userId, setUserId] = useState("");
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!userId.trim()) return;

    try {
      setLoading(true);
      const res = await api.get<WalletData>(`/users/${encodeURIComponent(userId.trim())}/wallet`);
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to lookup user wallet");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="User Wallet Lookup"
        subtitle="Search user wallet balances, audit credits and debits, and review full transaction ledger."
      />

      <Card className="p-6">
        <form onSubmit={handleLookup} className="flex gap-3 max-w-md">
          <input
            className="input flex-1"
            placeholder="Enter User ID (e.g. 101, 102)..."
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Lookup"}
          </Button>
        </form>
      </Card>

      {error && <ErrorState message={error} />}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-5">
              <div className="text-xs uppercase font-semibold text-[var(--muted)]">Active Wallet Balance</div>
              <div className="font-mono text-3xl font-bold text-[var(--teal)] mt-2">{inr(data.balance || 0)}</div>
              <p className="text-xs text-[var(--muted)] mt-1">Available for redemption</p>
            </Card>

            <Card className="p-5">
              <div className="text-xs uppercase font-semibold text-[var(--muted)]">Total Ledger Transactions</div>
              <div className="font-mono text-3xl font-bold text-[var(--ink)] mt-2">
                {data.transactions?.length || 0}
              </div>
              <p className="text-xs text-[var(--muted)] mt-1">Audit trail recorded</p>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="p-4 border-b border-[var(--line)] font-display font-bold text-base text-[var(--ink)]">
              Transaction History
            </div>
            {data.transactions?.length === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--muted)]">No transactions recorded for this user.</div>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Type</Th>
                    <Th>Amount</Th>
                    <Th>Reason / Event</Th>
                    <Th>Balance After</Th>
                    <Th className="text-right">Date</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-black/5 transition-colors">
                      <Td>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            tx.type === "credit"
                              ? "bg-[var(--teal-dim)] text-[var(--teal)]"
                              : "bg-[var(--coral-dim)] text-[var(--coral)]"
                          }`}
                        >
                          {tx.type.toUpperCase()}
                        </span>
                      </Td>
                      <Td
                        className={`font-mono font-bold ${
                          tx.type === "credit" ? "text-[var(--teal)]" : "text-[var(--coral)]"
                        }`}
                      >
                        {tx.type === "credit" ? "+" : "-"}
                        {inr(tx.amount)}
                      </Td>
                      <Td className="capitalize text-[var(--ink)]">{tx.reason?.replace(/_/g, " ") || "Reward Credit"}</Td>
                      <Td className="font-mono text-[var(--muted)]">{inr(tx.balanceAfter || 0)}</Td>
                      <Td className="text-right text-xs text-[var(--muted)] font-mono">{dateShort(tx.createdAt)}</Td>
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
