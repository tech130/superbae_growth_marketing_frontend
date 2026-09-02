"use client";

import { FormEvent, useEffect, useState } from "react";
import api from "@/lib/api";
import { inr, dateShort } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, ErrorState } from "@/components/ui";

type BrandPayout = {
  _id: string;
  brandName?: string;
  amount: number;
  payoutMethod: string;
  status: string;
  reference?: string;
  paidAt?: string;
  createdAt: string;
};

type BrandSimple = {
  _id: string;
  name: string;
  commissionEarned: number;
  commissionPaid: number;
};

export default function BrandPayoutsPage() {
  const [payouts, setPayouts] = useState<BrandPayout[]>([]);
  const [brands, setBrands] = useState<BrandSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [newPayout, setNewPayout] = useState({
    brandId: "",
    amount: 10000,
    payoutMethod: "Bank Transfer",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [payoutsData, brandsData] = await Promise.all([
        api.get<BrandPayout[]>("/brand-management/payouts"),
        api.get<BrandSimple[]>("/brand-management/brands"),
      ]);
      setPayouts(payoutsData || []);
      setBrands(brandsData || []);
      if (brandsData?.length > 0 && !newPayout.brandId) {
        setNewPayout((p) => ({ ...p, brandId: brandsData[0]._id }));
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load payouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePayout = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPayout.brandId || !newPayout.amount) {
      setError("Please select a brand and enter payout amount.");
      return;
    }

    try {
      await api.post("/brand-management/payouts", newPayout);
      setNotice("Brand payout processed and recorded successfully.");
      setTimeout(() => setNotice(null), 4000);
      setShowForm(false);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to initiate payout");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brand Payouts & Settlement"
        subtitle="Disburse partner commission earnings, review bank settlement references, and maintain payment ledger."
        action={
          <div className="flex gap-2">
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "+ Initiate Payout"}
            </Button>
            <Button variant="secondary" onClick={loadData}>
              Refresh
            </Button>
          </div>
        }
      />

      {notice && (
        <div className="p-4 rounded-xl text-sm font-medium bg-[var(--teal-dim)] text-[var(--teal)] border border-[var(--teal)]">
          {notice}
        </div>
      )}

      {error && <ErrorState message={error} />}

      {showForm && (
        <Card className="p-6 border-[var(--violet)] space-y-4 max-w-2xl">
          <div className="font-display font-bold text-lg text-[var(--ink)]">Process Partner Payout</div>
          <form onSubmit={handleCreatePayout} className="space-y-4">
            <label className="block text-sm font-medium">
              Select Brand Partner
              <select
                className="input mt-1.5"
                value={newPayout.brandId}
                onChange={(e) => setNewPayout({ ...newPayout, brandId: e.target.value })}
              >
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} (Payable: {inr((b.commissionEarned || 0) - (b.commissionPaid || 0))})
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-medium">
                Payout Amount (INR)
                <input
                  className="input mt-1.5"
                  type="number"
                  value={newPayout.amount}
                  onChange={(e) => setNewPayout({ ...newPayout, amount: Number(e.target.value) })}
                  required
                />
              </label>

              <label className="text-sm font-medium">
                Settlement Method
                <select
                  className="input mt-1.5"
                  value={newPayout.payoutMethod}
                  onChange={(e) => setNewPayout({ ...newPayout, payoutMethod: e.target.value })}
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </label>
            </div>

            <div className="pt-2">
              <Button type="submit">Confirm & Record Payout</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        {loading && payouts.length === 0 ? (
          <Loading />
        ) : payouts.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">No brand payouts recorded yet.</div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Brand Partner</Th>
                <Th>Amount</Th>
                <Th>Payment Method</Th>
                <Th>Reference ID</Th>
                <Th>Settled Date</Th>
                <Th className="text-right">Status</Th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p._id} className="hover:bg-black/5 transition-colors">
                  <Td className="font-semibold text-[var(--ink)]">{p.brandName || "Brand Partner"}</Td>
                  <Td className="font-mono font-bold text-[var(--teal)]">{inr(p.amount)}</Td>
                  <Td className="text-sm text-[var(--ink)]">{p.payoutMethod || "Bank Transfer"}</Td>
                  <Td className="font-mono text-xs text-[var(--muted)]">{p.reference || `PAY-${p._id.slice(-6)}`}</Td>
                  <Td className="text-xs text-[var(--muted)] font-mono">{p.paidAt ? dateShort(p.paidAt) : dateShort(p.createdAt)}</Td>
                  <Td className="text-right">
                    <StatusBadge status="Completed" />
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
