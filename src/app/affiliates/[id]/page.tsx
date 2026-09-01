"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Affiliate, Campaign, Conversion, Commission, Payout, FraudFlag } from "@/lib/types";
import { inr, num, dateShort } from "@/lib/format";
import { PageHeader, Card, StatusBadge, Button, Loading, ErrorState, Table, Th, Td, EmptyState } from "@/components/ui";

type Tab = "Overview" | "Links & Campaigns" | "Conversions" | "Commission History" | "Payout History" | "Activity Log";
const TABS: Tab[] = ["Overview", "Links & Campaigns", "Conversions", "Commission History", "Payout History", "Activity Log"];

interface ActivityEvent {
  date: string;
  label: string;
  detail?: string;
}

export default function AffiliateProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [a, setA] = useState<Affiliate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("Overview");

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [fraudFlags, setFraudFlags] = useState<FraudFlag[]>([]);

  function load() {
    api.get<Affiliate>(`/affiliates/${id}`).then(setA).catch((e) => setError(e.message));
    api.get<Campaign[]>(`/campaigns?affiliateId=${id}`).then(setCampaigns).catch(() => {});
    api.get<Conversion[]>(`/conversions?affiliateId=${id}`).then(setConversions).catch(() => {});
    api.get<Commission[]>(`/commissions?affiliateId=${id}`).then(setCommissions).catch(() => {});
    api.get<Payout[]>(`/payouts?affiliateId=${id}`).then(setPayouts).catch(() => {});
    api.get<FraudFlag[]>(`/fraud?affiliateId=${id}`).then(setFraudFlags).catch(() => {});
  }
  useEffect(load, [id]);

  if (error) return <ErrorState message={error} />;
  if (!a) return <Loading />;

  const p = a.performance!;

  const activity: ActivityEvent[] = [];
  activity.push({ date: a.createdAt, label: "Application submitted", detail: `Requested tier: ${a.tier}` });
  if (a.approvedAt) activity.push({ date: a.approvedAt, label: "Approved", detail: `By ${a.approvedBy || "Admin"} · code ${a.referralCode}` });
  if (a.rejectedReason) activity.push({ date: a.createdAt, label: "Rejected", detail: a.rejectedReason });
  for (const l of a.links || []) activity.push({ date: l.createdAt, label: "Tracking link created", detail: l.url });
  for (const c of campaigns) activity.push({ date: c.createdAt, label: `Campaign created — ${c.name}` });
  for (const cv of conversions) activity.push({ date: cv.convertedOn, label: `Conversion — ${cv.userName}`, detail: `${cv.subscriptionPlan} · ${inr(cv.revenue)}` });
  for (const cm of commissions) {
    activity.push({ date: cm.calculatedOn, label: `Commission calculated`, detail: inr(cm.amount) });
    if (cm.approvedOn) activity.push({ date: cm.approvedOn, label: `Commission ${cm.status.toLowerCase()}`, detail: inr(cm.amount) });
  }
  for (const po of payouts) {
    activity.push({ date: po.initiatedOn, label: "Payout initiated", detail: inr(po.amount) });
    if (po.completedOn) activity.push({ date: po.completedOn, label: `Payout ${po.status.toLowerCase()}`, detail: inr(po.amount) });
  }
  for (const f of fraudFlags) activity.push({ date: f.createdAt, label: `Fraud flag raised — ${f.riskLevel}`, detail: f.reasons.join("; ") });
  activity.sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime());

  return (
    <div>
      <PageHeader
        title={a.name}
        subtitle={a.company}
        action={
          <div className="flex gap-2">
            <Link href={`/affiliates/${a.id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            {a.status === "Active" && (
              <Button variant="secondary" onClick={() => api.post(`/affiliates/${a.id}/suspend`).then(load)}>
                Suspend
              </Button>
            )}
            {(a.status === "Suspended" || a.status === "Banned") && (
              <Button variant="secondary" onClick={() => api.patch(`/affiliates/${a.id}`, { status: "Active" }).then(load)}>
                Reinstate
              </Button>
            )}
            {(a.status === "Active" || a.status === "Suspended") && (
              <Button
                variant="danger"
                onClick={() => {
                  if (window.confirm("Ban this affiliate?")) api.post(`/affiliates/${a.id}/ban`).then(load);
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
        <span className="text-xs text-[var(--muted)]">Tier: {a.tier}</span>
        <span className="text-xs text-[var(--muted)]">· Joined {dateShort(a.createdAt)}</span>
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
              <Row label="Website" value={a.website || "—"} />
              <Row label="Social accounts" value={a.socials && a.socials.length ? a.socials.join(", ") : "—"} />
              <Row label="Category" value={a.category} />
              <Row label="Referral code" value={a.referralCode || "Not yet approved"} mono />
              <Row label="Tracking link" value={a.trackingLink || "—"} mono />
              <Row
                label="Commission"
                value={a.commissionType === "fixed" ? `Fixed ${inr(a.commissionValue)}` : `${a.commissionValue}% of first subscription`}
              />
              <Row label="Attribution window" value={`${a.cookieWindowDays} days`} />
              <Row label="Payment" value={a.paymentDetails ? `${a.paymentDetails.method} — ${a.paymentDetails.accountRef}` : "—"} />
              <Row label="Tax info" value={a.taxInfo || "—"} />
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="font-display font-semibold text-[15px] mb-3">Performance Summary</h2>
            <div className="space-y-2 text-[13.5px]">
              <Metric label="Total Clicks" value={num(p.totalClicks)} />
              <Metric label="Leads" value={num(p.leads)} />
              <Metric label="Conversions" value={num(p.conversions)} />
              <Metric label="Revenue Generated" value={inr(p.revenueGenerated)} />
              <Metric label="Commission Earned" value={inr(p.commissionEarned)} />
              <Metric label="Commission Paid" value={inr(p.commissionPaid)} />
            </div>
          </Card>
        </div>
      )}

      {tab === "Links & Campaigns" && (
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="font-display font-semibold text-[15px] mb-3">Tracking Links</h2>
            {a.links && a.links.length > 0 ? (
              <div className="space-y-2">
                {a.links.map((l) => (
                  <div key={l.id} className="flex items-center justify-between text-[13.5px] py-2 border-b border-[var(--line)] last:border-0">
                    <span className="font-mono text-[var(--violet)]">{l.url}</span>
                    <div className="flex items-center gap-4 text-[var(--muted)]">
                      <span>{l.clicks} clicks</span>
                      <span>{l.leads} leads</span>
                      <span>{l.conversions} conv.</span>
                      <StatusBadge status={l.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">No tracking links yet.</p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-display font-semibold text-[15px] mb-3">Campaigns</h2>
            {campaigns.length > 0 ? (
              <Table>
                <thead>
                  <tr>
                    <Th>Campaign</Th>
                    <Th>Category</Th>
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
                      <Td className="font-mono">{c.clicks}</Td>
                      <Td className="font-mono">{c.conversions}</Td>
                      <Td><StatusBadge status={c.status} /></Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-sm text-[var(--muted)]">No campaigns yet.</p>
            )}
          </Card>
        </div>
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
                    <Td><StatusBadge status={c.status} /></Td>
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
                  <Th>Type</Th>
                  <Th>Status</Th>
                  <Th>Calculated on</Th>
                  <Th>Approved on</Th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c.id}>
                    <Td className="font-mono">{inr(c.amount)}</Td>
                    <Td>{c.type}</Td>
                    <Td><StatusBadge status={c.status} /></Td>
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
                    <Td><StatusBadge status={p.status} /></Td>
                    <Td>{dateShort(p.initiatedOn)}</Td>
                    <Td>{p.completedOn ? dateShort(p.completedOn) : "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}

      {tab === "Activity Log" && (
        <Card className="p-5">
          {activity.length === 0 ? (
            <EmptyState title="No activity yet" />
          ) : (
            <ol className="relative border-l border-[var(--line)] pl-4 space-y-4 text-[13px]">
              {activity.map((ev, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-[var(--violet)]" />
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium">{ev.label}</span>
                    <span className="text-[11px] text-[var(--muted)]">{dateShort(ev.date)}</span>
                  </div>
                  {ev.detail && <div className="text-[12px] text-[var(--muted)]">{ev.detail}</div>}
                </li>
              ))}
            </ol>
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
