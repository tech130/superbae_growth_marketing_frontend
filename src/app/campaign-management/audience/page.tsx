"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { num } from "@/lib/format";
import { PageHeader, Card, Button, Table, Th, Td, EmptyState } from "@/components/ui";

const CATEGORIES = ["Fashion", "Beauty", "Wellness", "Travel", "Fitness", "Lifestyle", "Restaurants", "Experiences"];
const NEW_VS_EXISTING = ["Both", "New Users", "Existing Users"];
const PLATFORMS = ["Both", "iOS", "Android"];

const inputClass =
  "w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-white outline-none focus:ring-2 focus:ring-[var(--violet)]";
const labelClass = "block text-[11px] uppercase tracking-wide text-[var(--muted)] font-semibold mb-1.5";

interface Segment {
  name: string;
  category: string;
  newVsExisting: string;
  geography: string;
  platform: string;
  ageRange: string;
}

const STORAGE_KEY = "superbae.campaign-audience-segments";

export default function AudiencePage() {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [newVsExisting, setNewVsExisting] = useState(NEW_VS_EXISTING[0]);
  const [geography, setGeography] = useState("India");
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [ageRange, setAgeRange] = useState("");
  const [segmentName, setSegmentName] = useState("");

  const [estimate, setEstimate] = useState<{ estimatedReach: number; matchingAffiliates: number; matchingCreatorReach: number } | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSegments(JSON.parse(raw));
    } catch {
      // ignore — per-browser convenience only
    }
  }, []);

  function persist(next: Segment[]) {
    setSegments(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore — storage may be unavailable (private mode, etc.)
    }
  }

  async function previewReach() {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (platform !== "Both") params.set("platform", platform);
    const r = await api.get<{ estimatedReach: number; matchingAffiliates: number; matchingCreatorReach: number }>(
      `/campaign-management/audience/estimate?${params.toString()}`
    );
    setEstimate(r);
  }

  function saveSegment() {
    if (!segmentName.trim()) return;
    persist([...segments, { name: segmentName.trim(), category, newVsExisting, geography, platform, ageRange }]);
    setSegmentName("");
  }

  function loadSegment(s: Segment) {
    setCategory(s.category);
    setNewVsExisting(s.newVsExisting);
    setGeography(s.geography);
    setPlatform(s.platform);
    setAgeRange(s.ageRange);
    setEstimate(null);
  }

  function removeSegment(name: string) {
    persist(segments.filter((s) => s.name !== name));
  }

  return (
    <div>
      <PageHeader
        title="Audience"
        subtitle="Define who a campaign targets — used at campaign creation and referenced in performance breakdowns."
      />

      <div className="grid grid-cols-3 gap-5">
        <Card className="col-span-2 p-6">
          <h2 className="font-display font-semibold text-[15px] mb-4">Define Audience Segment</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>Category / niche</label>
              <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>New vs existing users</label>
              <select className={inputClass} value={newVsExisting} onChange={(e) => setNewVsExisting(e.target.value)}>
                {NEW_VS_EXISTING.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>Geography / country</label>
              <input className={inputClass} value={geography} onChange={(e) => setGeography(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Platform</label>
              <select className={inputClass} value={platform} onChange={(e) => setPlatform(e.target.value)}>
                {PLATFORMS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-5">
            <label className={labelClass}>Age range (if applicable)</label>
            <input className={`${inputClass} max-w-xs`} value={ageRange} onChange={(e) => setAgeRange(e.target.value)} placeholder="e.g. 18-34" />
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-[var(--line)]">
            <Button onClick={previewReach}>Preview estimated reach</Button>
            <input
              className={`${inputClass} w-56`}
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              placeholder="Segment name to save…"
            />
            <Button variant="secondary" onClick={saveSegment}>
              Save as reusable segment
            </Button>
          </div>

          {estimate && (
            <div className="mt-5 p-4 rounded-lg bg-[var(--violet-dim)] text-[13.5px]">
              <div className="font-medium mb-1">≈ {num(estimate.estimatedReach)} people estimated reach</div>
              <div className="text-[var(--muted)] text-[12px]">
                {num(estimate.matchingAffiliates)} matching partners in this category · {num(estimate.matchingCreatorReach)} of that reach from
                creators. This is a rough estimate from live partner/creator data, not measured impressions.
              </div>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-display font-semibold text-[15px] mb-3">Saved Segments</h2>
          {segments.length === 0 ? (
            <EmptyState title="No saved segments" subtitle="Save a segment to reuse it on the next campaign." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {segments.map((s) => (
                  <tr key={s.name}>
                    <Td>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-[11px] text-[var(--muted)]">
                        {s.category} · {s.newVsExisting} · {s.platform}
                      </div>
                    </Td>
                    <Td>
                      <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => loadSegment(s)}>
                          Load
                        </Button>
                        <Button variant="danger" onClick={() => removeSegment(s.name)}>
                          Delete
                        </Button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
