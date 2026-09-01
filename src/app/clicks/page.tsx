"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { Click, Affiliate, Lead } from "@/lib/types";
import { num } from "@/lib/format";
import { PageHeader, Card, KpiCard, Table, Th, Td, Loading, EmptyState, ErrorState } from "@/components/ui";
import { BarChart } from "@/components/Charts";

export default function ClicksPage() {
  const [rows, setRows] = useState<Click[] | null>(null);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [affiliateId, setAffiliateId] = useState("");
  const [source, setSource] = useState("");
  const [device, setDevice] = useState("");
  const [country, setCountry] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    api.get<Click[]>("/clicks").then((r) => setRows(r.slice(-500).reverse())).catch((e) => setError(e.message));
    api.get<Affiliate[]>("/affiliates").then(setAffiliates).catch(() => {});
    api.get<Lead[]>("/leads").then(setLeads).catch(() => {});
  }, []);

  const nameFor = (id: string) => affiliates.find((a) => a.id === id)?.name || id.slice(0, 6);

  const sources = useMemo(() => Array.from(new Set((rows || []).map((c) => c.source))).sort(), [rows]);
  const devices = useMemo(() => Array.from(new Set((rows || []).map((c) => c.device))).sort(), [rows]);
  const countries = useMemo(() => Array.from(new Set((rows || []).map((c) => c.country))).sort(), [rows]);

  const filtered = (rows || []).filter((c) => {
    if (affiliateId && c.affiliateId !== affiliateId) return false;
    if (source && c.source !== source) return false;
    if (device && c.device !== device) return false;
    if (country && c.country !== country) return false;
    if (from && new Date(c.timestamp) < new Date(from)) return false;
    if (to && new Date(c.timestamp) > new Date(to + "T23:59:59")) return false;
    return true;
  });

  const uniqueIps = new Set(filtered.map((c) => c.ip)).size;
  const filteredIds = new Set(filtered.map((c) => c.id));
  const leadsFromFiltered = leads.filter((l) => l.clickId && filteredIds.has(l.clickId)).length;
  const clickToLeadRate = filtered.length ? ((leadsFromFiltered / filtered.length) * 100).toFixed(1) : "0.0";

  const bySource = sources.map((s) => ({ label: s, value: filtered.filter((c) => c.source === s).length })).sort((a, b) => b.value - a.value);
  const byDevice = devices.map((d) => ({ label: d, value: filtered.filter((c) => c.device === d).length })).sort((a, b) => b.value - a.value);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader title="Affiliate Clicks" subtitle="Raw click-level tracking — the top of the affiliate funnel. Showing the most recent 500." />

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <select className="input w-44" value={affiliateId} onChange={(e) => setAffiliateId(e.target.value)}>
          <option value="">All affiliates</option>
          {affiliates.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <select className="input w-36" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">All platforms</option>
          {sources.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className="input w-36" value={device} onChange={(e) => setDevice(e.target.value)}>
          <option value="">All devices</option>
          {devices.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <select className="input w-36" value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input type="date" className="input w-40" value={from} onChange={(e) => setFrom(e.target.value)} />
        <span className="text-xs text-[var(--muted)]">to</span>
        <input type="date" className="input w-40" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      {!rows ? (
        <Loading />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-5">
            <KpiCard label="Total Clicks" value={num(filtered.length)} accent="violet" />
            <KpiCard label="Unique Clicks" value={num(uniqueIps)} accent="teal" />
            <KpiCard label="Click-to-Lead Rate" value={`${clickToLeadRate}%`} accent="amber" />
            <KpiCard label="Countries" value={num(countries.length)} accent="violet" />
          </div>

          <div className="grid grid-cols-2 gap-5 mb-5">
            <Card className="p-5">
              <h2 className="font-display font-semibold text-[15px] mb-3">Clicks by Platform</h2>
              {bySource.length === 0 ? <p className="text-sm text-[var(--muted)]">No data.</p> : <BarChart data={bySource} />}
            </Card>
            <Card className="p-5">
              <h2 className="font-display font-semibold text-[15px] mb-3">Clicks by Device</h2>
              {byDevice.length === 0 ? <p className="text-sm text-[var(--muted)]">No data.</p> : <BarChart data={byDevice} color="var(--teal)" />}
            </Card>
          </div>

          <Card>
            {filtered.length === 0 ? (
              <EmptyState title="No clicks match this filter" />
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Timestamp</Th>
                    <Th>Affiliate</Th>
                    <Th>Source</Th>
                    <Th>Device</Th>
                    <Th>IP / Location</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 200).map((c) => (
                    <tr key={c.id}>
                      <Td className="font-mono text-[12px]">{new Date(c.timestamp).toLocaleString("en-IN")}</Td>
                      <Td>{nameFor(c.affiliateId)}</Td>
                      <Td>{c.source}</Td>
                      <Td>{c.device}</Td>
                      <Td className="font-mono text-[12px]">
                        {c.ip} · {c.country}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
