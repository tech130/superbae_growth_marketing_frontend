"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Affiliate, SocialProfile } from "@/lib/types";
import { num, dateShort } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

const PLATFORMS = ["Instagram", "YouTube", "TikTok", "Facebook", "X", "Other"];

export default function SocialProfilesPage() {
  const [creators, setCreators] = useState<Affiliate[]>([]);
  const [selected, setSelected] = useState("");
  const [creator, setCreator] = useState<Affiliate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [newPlatform, setNewPlatform] = useState(PLATFORMS[0]);
  const [newHandle, setNewHandle] = useState("");
  const [newFollowers, setNewFollowers] = useState("");

  useEffect(() => {
    api
      .get<Affiliate[]>("/creators")
      .then((rows) => {
        setCreators(rows);
        if (rows.length) setSelected(rows[0].id);
      })
      .catch((e) => setError(e.message));
  }, []);

  function loadCreator(id: string) {
    if (!id) return;
    api.get<Affiliate>(`/creators/${id}`).then(setCreator).catch((e) => setError(e.message));
  }
  useEffect(() => loadCreator(selected), [selected]);

  async function addProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!newHandle.trim() || !selected) return;
    setBusy(true);
    try {
      await api.post(`/creators/${selected}/social-profiles`, {
        platform: newPlatform,
        handle: newHandle.trim(),
        followers: Number(newFollowers) || 0,
      });
      setNewHandle("");
      setNewFollowers("");
      loadCreator(selected);
    } finally {
      setBusy(false);
    }
  }

  async function refresh(profileId: string) {
    setBusy(true);
    try {
      await api.post(`/creators/${selected}/social-profiles/${profileId}/refresh`);
      loadCreator(selected);
    } finally {
      setBusy(false);
    }
  }
  async function reverify(profile: SocialProfile) {
    setBusy(true);
    try {
      await api.patch(`/creators/${selected}/social-profiles/${profile.id}`, { verified: !profile.verified });
      loadCreator(selected);
    } finally {
      setBusy(false);
    }
  }
  async function remove(profileId: string) {
    if (!window.confirm("Remove this social profile?")) return;
    setBusy(true);
    try {
      await api.delete(`/creators/${selected}/social-profiles/${profileId}`);
      loadCreator(selected);
    } finally {
      setBusy(false);
    }
  }

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Social Profiles"
        subtitle="Every linked social account for a creator — platform, handle, follower count, verification and engagement."
        action={
          <select className="input w-56" value={selected} onChange={(e) => setSelected(e.target.value)}>
            {creators.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        }
      />

      <Card className="p-5">
        {!creator ? (
          <Loading />
        ) : (creator.socialProfiles || []).length === 0 ? (
          <EmptyState title="No social profiles linked yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Platform</Th>
                <Th>Handle</Th>
                <Th>Followers</Th>
                <Th>Verified</Th>
                <Th>Engagement</Th>
                <Th>Last synced</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {(creator.socialProfiles || []).map((sp) => (
                <tr key={sp.id}>
                  <Td>{sp.platform}</Td>
                  <Td className="font-mono">{sp.handle}</Td>
                  <Td className="font-mono">{num(sp.followers)}</Td>
                  <Td>
                    <StatusBadge status={sp.verified ? "Active" : "Pending"} />
                  </Td>
                  <Td>{sp.engagementRate ? `${sp.engagementRate}%` : "—"}</Td>
                  <Td>{dateShort(sp.lastSyncedAt)}</Td>
                  <Td>
                    <div className="flex gap-2">
                      <Button variant="secondary" disabled={busy} onClick={() => refresh(sp.id)}>
                        Refresh
                      </Button>
                      <Button variant="secondary" disabled={busy} onClick={() => reverify(sp)}>
                        {sp.verified ? "Unverify" : "Verify"}
                      </Button>
                      <Button variant="danger" disabled={busy} onClick={() => remove(sp.id)}>
                        Remove
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {creator && (
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
        )}
      </Card>
    </div>
  );
}
