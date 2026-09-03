"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { LandingPageTemplate } from "@/lib/types";
import { Affiliate } from "@/lib/types";
import { PageHeader, Card, Button } from "@/components/ui";

const SOURCE_TYPES = ["Campaign", "Referral", "Affiliate", "Creator", "Manual"] as const;

export default function CreateLandingPagePage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<LandingPageTemplate[]>([]);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [name, setName] = useState("");
  const [sourceType, setSourceType] = useState<(typeof SOURCE_TYPES)[number]>("Campaign");
  const [templateId, setTemplateId] = useState("");
  const [linkedRefId, setLinkedRefId] = useState("");
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [cta, setCta] = useState("Get Started");
  const [targetRoute, setTargetRoute] = useState("home");
  const [generateQr, setGenerateQr] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<LandingPageTemplate[]>("/landing-pages/templates").then(setTemplates).catch(() => undefined);
    api.get<Affiliate[]>("/affiliates?status=Active").then(setAffiliates).catch(() => undefined);
  }, []);

  async function submit() {
    if (!name.trim()) return alert("Page name is required");
    setSaving(true);
    try {
      const linkedRef = affiliates.find((a) => a.id === linkedRefId);
      await api.post("/landing-pages", {
        name,
        sourceType,
        templateId: templateId || undefined,
        linkedRefId: sourceType === "Affiliate" || sourceType === "Creator" ? linkedRefId || undefined : undefined,
        linkedRefLabel: linkedRef?.name,
        headline,
        body,
        cta,
        targetRoute,
        generateQr,
      });
      router.push("/landing-pages");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Create Landing Page" subtitle="Build a page from a template or from scratch, and wire it to a tracking link and deep link." />
      <Card className="p-6 max-w-2xl space-y-4">
        <div>
          <label className="text-xs text-[var(--muted)]">Page name</label>
          <input className="input w-full mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Diwali Push LP" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[var(--muted)]">Source type</label>
            <select className="input w-full mt-1" value={sourceType} onChange={(e) => setSourceType(e.target.value as any)}>
              {SOURCE_TYPES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--muted)]">Template</label>
            <select className="input w-full mt-1" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
              <option value="">Blank</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {(sourceType === "Affiliate" || sourceType === "Creator") && (
          <div>
            <label className="text-xs text-[var(--muted)]">Linked affiliate / creator</label>
            <select className="input w-full mt-1" value={linkedRefId} onChange={(e) => setLinkedRefId(e.target.value)}>
              <option value="">— Select —</option>
              {affiliates
                .filter((a) => (sourceType === "Creator" ? a.tier === "Premium Creator" : a.tier !== "Premium Creator"))
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
            </select>
          </div>
        )}
        <div>
          <label className="text-xs text-[var(--muted)]">Headline</label>
          <input className="input w-full mt-1" value={headline} onChange={(e) => setHeadline(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-[var(--muted)]">Body</label>
          <textarea className="input w-full mt-1" rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[var(--muted)]">Call to action</label>
            <input className="input w-full mt-1" value={cta} onChange={(e) => setCta(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-[var(--muted)]">Destination deep link (in-app route)</label>
            <input className="input w-full mt-1" value={targetRoute} onChange={(e) => setTargetRoute(e.target.value)} placeholder="offer/diwali" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={generateQr} onChange={(e) => setGenerateQr(e.target.checked)} />
          Generate a QR code for this page
        </label>
        <Button onClick={submit} disabled={saving}>
          {saving ? "Creating…" : "Create page (Draft)"}
        </Button>
      </Card>
    </div>
  );
}
