"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Affiliate, Campaign, Conversion, Commission, Payout, SocialProfile } from "@/lib/types";
import { inr, num, dateShort } from "@/lib/format";
import { PageHeader, Card, StatusBadge, Button, Loading, ErrorState, Table, Th, Td, EmptyState } from "@/components/ui";

type Tab = "Overview" | "Social Profiles" | "Campaigns" | "Conversions" | "Commission History" | "Payout History";
const TABS: Tab[] = ["Overview", "Social Profiles", "Campaigns", "Conversions", "Commission History", "Payout History"];

const PLATFORMS = ["Instagram", "YouTube", "TikTok", "Facebook", "X", "Other"];

export default function CreatorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [a, setA] = useState<Affiliate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("Overview");
  const [busy, setBusy] = useState(false);

  const [newPlatform, setNewPlatform] = useState(PLATFORMS[0]);
  const [newHandle, setNewHandle] = useState("");
  const [newFollowers, setNewFollowers] = useState("");

  function load() {
    api.get<Affiliate>(`/creators/${id}`).then(setA).catch((e) => setError(e.message));
  }
  useEffect(load, [id]);

  if (error) return <ErrorState message={error} />;
  if (!a) return <Loading />;

  const p = a.performance!;
  const campaigns: Campaign[] = a.campaigns || [];
  const conversions: Conversion[] = a.conversions || [];
  const commissions: Commission[] = a.commissions || [];
  const payouts: Payout[] = a.payouts || [];

  async function addProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!newHandle.trim()) return;
    setBusy(true);
    try {
      await api.post(`/creators/${id}/social-profiles`, {
        platform: newPlatform,
        handle: newHandle.trim(),
        followers: Number(newFollowers) || 0,
      });
      setNewHandle("");
      setNewFollowers("");
      load();
    } finally {
      setBusy(false);
    }
  }

  async function refreshProfile(profileId: string) {
    setBusy(true);
    try {
      await api.post(`/creators/${id}/social-profiles/${profileId}/refresh`);
      load();
    } finally {
      setBusy(false);
    }
  }
  async function reverifyProfile(profile: SocialProfile) {
    setBusy(true);
    try {
      await api.patch(`/creators/${id}/social-profiles/${profile.id}`, { verified: !profile.verified });
      load();
    } finally {
      setBusy(false);
    }
  }
  async function removeProfile(profileId: string) {
    if (!window.confirm("Remove this social profile?")) return;
    setBusy(true);
    try {
      await api.delete(`/creators/${id}/social-profiles/${profileId}`);
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={a.name}
        subtitle={a.category}
        action={
          <div className="flex gap-2">
            <Link href={`/creators/${a.id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            {a.status === "Active" && (
              <Button variant="secondary" onClick={() => api.post(`/creators/${a.id}/suspend`).then(load)}>
                Suspend
              </Button>
            )}
            {(a.status === "Suspended" || a.status === "Banned") && (
              <Button variant="secondary" onClick={() => api.patch(`/creators/${a.id}`, { status: "Active" }).then(load)}>
                Reinstate
              </Button>
            )}
            {(a.status === "Active" || a.status === "Suspended") && (
              <Button
                variant="danger"
                onClick={() => {
                  if (window.confirm("Ban this creator?")) api.post(`/creators/${a.id}/ban`).then(load);
                }}
              >
                Ban
              </Button>
            )}
          </div>
        }
      />

      <div className="flex items-center gap-2 mb-4">
        <StatusBadge status={a.status} />
        <span className="text-xs text-[var(--muted)]">Premium Creator tier</span>
        <span className="text-xs text-[var(--muted)]">· Joined {dateShort(a.createdAt)}</span>
        <span className="text-xs text-[var(--muted)]">· Reach {num(a.reach ?? 0)}</span>
      </div>

      <div className="flex gap-1 mb-5 border-b border-[var(--line)]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? "border-[var(--violet)] text-[var(--violet)]" : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid grid-cols-3 gap-5">
          <Card className="col-span-2 p-5">
            <dl className="grid grid-cols-2 gap-y-3 text-[13.5px]">
              <Row label="Email" value={a.email} />
              <Row label="Phone" value={a.phone || "—"} />
              <Row label="Category" value={a.category} />
              <Row label="Referral code" value={a.referralCode || "Not yet approved"} mono />
              <Row label="Tracking link" value={a.trackingLink || "—"} mono />
              <Row label="Commission" value={`${a.commissionValue}% of first subscription`} />
              <Row label="Attribution window" value={`${a.cookieWindowDays} days`} />
              <Row label="Payment" value={a.paymentDetails ? `${a.paymentDetails.method} — ${a.paymentDetails.accountRef}` : "—"} />
              <Row label="Tax info" value={a.taxInfo || "—"} />
            </dl>
            {a.verification && (
              <div className="mt-4 pt-4 border-t border-[var(--line)]">
                <h3 className="text-[11px] uppercase tracking-wide text-[var(--muted)] font-semibold mb-2">Verification</h3>
                <div className="flex flex-wrap gap-3 text-[12.5px]">
                  <span className={a.verification.identityVerified ? "text-[var(--teal)]" : "text-[var(--muted)]"}>
                    {a.verification.identityVerified ? "✓" : "○"} Identity
                  </span>
                  <span className={a.verification.socialVerified ? "text-[var(--teal)]" : "text-[var(--muted)]"}>
                    {a.verification.socialVerified ? "✓" : "○"} Social ownership
                  </span>
                  <span className={a.verification.followerAuthenticityChecked ? "text-[var(--teal)]" : "text-[var(--muted)]"}>
                    {a.verification.followerAuthenticityChecked ? "✓" : "○"} Follower authenticity
                  </span>
                  <span className={a.verification.audienceRelevanceChecked ? "text-[var(--teal)]" : "text-[var(--muted)]"}>
                    {a.verification.audienceRelevanceChecked ? "✓" : "○"} Audience relevance
                  </span>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-display font-semibold text-[15px] mb-3">Performance Summary</h2>
            <div className="space-y-2 text-[13.5px]">
              <Metric label="Reach" value={num(a.reach ?? 0)} />
              <Metric label="Clicks" value={num(p.totalClicks)} />
              <Metric label="Leads" value={num(p.leads)} />
              <Metric label="Conversions" value={num(p.conversions)} />
              <Metric label="Revenue" value={inr(p.revenueGenerated)} />
              <Metric label="Commission Earned" value={inr(p.commissionEarned)} />
            </div>
          </Card>
        </div>
      )}

      {tab === "Social Profiles" && (
        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Linked Social Accounts</h2>
          {(a.socialProfiles || []).length === 0 ? (
            <p className="text-sm text-[var(--muted)] mb-4">No social profiles linked yet.</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Platform</Th>
                  <Th>Handle</Th>
                  <Th>Followers</Th>
                  <Th>Verified</Th>
                  <Th>Last synced</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {(a.socialProfiles || []).map((sp) => (
                  <tr key={sp.id}>
                    <Td>{sp.platform}</Td>
                    <Td className="font-mono">{sp.handle}</Td>
                    <Td className="font-mono">{num(sp.followers)}</Td>
                    <Td>
                      <StatusBadge status={sp.verified ? "Active" : "Pending"} />
                    </Td>
                    <Td>{dateShort(sp.lastSyncedAt)}</Td>
                    <Td>
                      <div className="flex gap-2">
                        <Button variant="secondary" disabled={busy} onClick={() => refreshProfile(sp.id)}>
                          Refresh
                        </Button>
                        <Button variant="secondary" disabled={busy} onClick={() => reverifyProfile(sp)}>
                          {sp.verified ? "Unverify" : "Verify"}
                        </Button>
                        <Button variant="danger" disabled={busy} onClick={() => removeProfile(sp.id)}>
                          Remove
                        </Button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          <form onSubmit={addProfile} className="flex items-end gap-2 mt-5 pt-4 border-t border-[var(--line)]">
            <label className="text-xs">
              <div className="text-[var(--muted)] mb-1">Platform</div>
              <select className="input" value={newPlatform} onChange={(e) => setNewPlatform(e.target.value)}>
                {PLATFORMS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="text-xs flex-1">
              <div className="text-[var(--muted)] mb-1">Handle</div>
              <input className="input" value={newHandle} onChange={(e) => setNewHandle(e.target.value)} placeholder="@handle" />
            </label>
            <label className="text-xs">
              <div className="text-[var(--muted)] mb-1">Followers</div>
              <input
                type="number"
                min={0}
                className="input w-32"
                value={newFollowers}
                onChange={(e) => setNewFollowers(e.target.value)}
              />
            </label>
            <Button type="submit" disabled={busy}>
              Add profile
            </Button>
          </form>
        </Card>
      )}

      {tab === "Campaigns" && (
        <Card>
          {campaigns.length === 0 ? (
            <EmptyState title="No campaigns yet" />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Campaign</Th>
                  <Th>Category</Th>
                  <Th>Content type</Th>
                  <Th>Clicks</Th>
                  <Th>Conversions</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id}>
                    <Td className="font-medium">{c.name}</Td>
                    <Td>{c.category}</Td>
                    <Td>{c.contentType || "—"}</Td>
                    <Td className="font-mono">{c.clicks}</Td>
                    <Td className="font-mono">{c.conversions}</Td>
                    <Td>
                      <StatusBadge status={c.status} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}

      {tab === "Conversions" && (
        <Card>
          {conversions.length === 0 ? (
            <EmptyState title="No conversions yet" />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Converted user</Th>
                  <Th>Converted on</Th>
                  <Th>Subscription</Th>
                  <Th>Revenue</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {conversions.map((c) => (
                  <tr key={c.id}>
                    <Td className="font-medium">{c.userName}</Td>
                    <Td>{dateShort(c.convertedOn)}</Td>
                    <Td>{c.subscriptionPlan}</Td>
                    <Td className="font-mono">{inr(c.revenue)}</Td>
                    <Td>
                      <StatusBadge status={c.status} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}

      {tab === "Commission History" && (
        <Card>
          {commissions.length === 0 ? (
            <EmptyState title="No commission records yet" />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Calculated on</Th>
                  <Th>Approved on</Th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c.id}>
                    <Td className="font-mono">{inr(c.amount)}</Td>
                    <Td>
                      <StatusBadge status={c.status} />
                    </Td>
                    <Td>{dateShort(c.calculatedOn)}</Td>
                    <Td>{c.approvedOn ? dateShort(c.approvedOn) : "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}

      {tab === "Payout History" && (
        <Card>
          {payouts.length === 0 ? (
            <EmptyState title="No payouts yet" />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Amount</Th>
                  <Th>Method</Th>
                  <Th>Status</Th>
                  <Th>Initiated</Th>
                  <Th>Completed</Th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id}>
                    <Td className="font-mono">{inr(p.amount)}</Td>
                    <Td>{p.method}</Td>
                    <Td>
                      <StatusBadge status={p.status} />
                    </Td>
                    <Td>{dateShort(p.initiatedOn)}</Td>
                    <Td>{p.completedOn ? dateShort(p.completedOn) : "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <>
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className={mono ? "font-mono text-[12.5px]" : ""}>{value}</dd>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-mono font-medium">{value}</span>
    </div>
  );
}
