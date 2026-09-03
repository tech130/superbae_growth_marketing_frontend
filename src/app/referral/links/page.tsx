"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { num } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, ErrorState } from "@/components/ui";

type ReferralLinkItem = {
  id: number;
  url: string;
  code: string;
  owner_name: string;
  owner_email: string;
  clicks: number;
  unique_clicks: number;
  signups: number;
  conversions: number;
  status: "active" | "disabled";
  created_at: string;
};

export default function ReferralLinksPage() {
  const [links, setLinks] = useState<ReferralLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // QR Modal State
  const [qrData, setQrData] = useState<{ url: string; image: string } | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const data = await api.get<ReferralLinkItem[]>("/admin/referral-links/");
      setLinks(data || []);
      setNotice(null);
    } catch (err: any) {
      setNotice({
        text: err.message || "Could not load referral links.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, []);

  const handleDisableLink = async (linkId: number) => {
    if (!confirm("Are you sure you want to disable this referral link?")) return;
    try {
      await api.patch(`/admin/referral-links/${linkId}/disable/`);
      setNotice({ text: "Referral link disabled successfully.", type: "success" });
      await loadLinks();
    } catch (err: any) {
      setNotice({ text: err.message || "Failed to disable link.", type: "error" });
    }
  };

  const handleShowQr = async (linkId: number) => {
    try {
      setQrLoading(true);
      const res = await api.post<{ url: string; image: string }>(`/admin/referral-links/${linkId}/qr/`);
      setQrData(res);
    } catch (err: any) {
      setNotice({ text: err.message || "Could not generate QR code.", type: "error" });
    } finally {
      setQrLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setNotice({ text: "Link copied to clipboard!", type: "success" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referral Links"
        subtitle="Track unique visitor click-through rates, attribution URLs, and mobile QR codes."
        action={
          <Button variant="secondary" onClick={loadLinks}>
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

      <Card className="overflow-hidden">
        {loading && links.length === 0 ? (
          <Loading />
        ) : links.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">
            No referral links generated yet. Links are automatically generated when users request their link.
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Referral URL</Th>
                <Th>Code & Owner</Th>
                <Th>Clicks (Total / Unique)</Th>
                <Th>Signups</Th>
                <Th>Conversions</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-black/5 transition-colors">
                  <Td className="max-w-xs truncate font-mono text-xs text-[var(--ink)]">{link.url}</Td>
                  <Td>
                    <p className="font-mono font-bold text-[var(--violet)]">{link.code}</p>
                    <p className="text-xs text-[var(--muted)]">{link.owner_name || link.owner_email}</p>
                  </Td>
                  <Td className="font-mono text-[var(--ink)]">
                    {num(link.clicks)} <span className="text-xs text-[var(--muted)]">({num(link.unique_clicks)} unique)</span>
                  </Td>
                  <Td className="font-mono text-[var(--muted)]">{num(link.signups)}</Td>
                  <Td className="font-mono font-bold text-[var(--teal)]">{num(link.conversions)}</Td>
                  <Td>
                    <StatusBadge status={link.status === "active" ? "Active" : "Disabled"} />
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-3 text-xs font-semibold">
                      <button
                        onClick={() => copyToClipboard(link.url)}
                        className="text-[var(--ink)] hover:underline"
                      >
                        Copy URL
                      </button>
                      <button
                        onClick={() => handleShowQr(link.id)}
                        className="text-[var(--violet)] hover:underline"
                      >
                        QR Code
                      </button>
                      {link.status === "active" && (
                        <button
                          onClick={() => handleDisableLink(link.id)}
                          className="text-[var(--coral)] hover:underline"
                        >
                          Disable
                        </button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* QR Code Modal */}
      {(qrData || qrLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-sm p-6 text-center shadow-xl space-y-4">
            <div className="font-display font-bold text-lg text-[var(--ink)]">Referral QR Code</div>
            <p className="text-xs text-[var(--muted)]">Scan with camera to open the referral link on mobile</p>

            {qrLoading ? (
              <div className="py-8 text-sm text-[var(--muted)]">Generating QR code...</div>
            ) : qrData ? (
              <div className="flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrData.image} alt="Referral Link QR" className="h-44 w-44 rounded-lg border border-[var(--line)] p-2 bg-white" />
                <p className="mt-3 max-w-xs truncate font-mono text-xs text-[var(--muted)]">{qrData.url}</p>
              </div>
            ) : null}

            <div className="flex justify-center pt-2">
              <Button variant="secondary" onClick={() => setQrData(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
