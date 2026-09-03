"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { QRCodeRow } from "@/lib/types";
import { num } from "@/lib/format";
import { PageHeader, Card, Table, Th, Td, StatusBadge, Button, Loading, EmptyState, ErrorState } from "@/components/ui";

export default function QRCodesPage() {
  const [rows, setRows] = useState<QRCodeRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ id: string; dataUrl: string; target: string } | null>(null);

  function load() {
    api.get<QRCodeRow[]>("/landing-pages/qr-codes").then(setRows).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  async function viewQr(id: string) {
    const res = await api.get<{ dataUrl: string; target: string }>(`/landing-pages/qr-codes/${id}/image?format=png`);
    setPreview({ id, ...res });
  }

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader title="QR Codes" subtitle="Generates and manages QR codes for any landing page or deep link — used for offline, creator, and in-store promotion." />

      {preview && (
        <Card className="p-5 mb-5 flex items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview.dataUrl} alt="QR code" className="w-32 h-32 rounded-lg border border-[var(--line)]" />
          <div className="text-sm">
            <div className="text-[var(--muted)] text-xs mb-1">Encodes</div>
            <div className="font-mono text-xs break-all mb-3">{preview.target}</div>
            <div className="flex gap-2">
              <a href={preview.dataUrl} download={`qr-${preview.id}.png`} className="inline-block">
                <Button variant="secondary">Download PNG</Button>
              </a>
              <Button variant="ghost" onClick={() => setPreview(null)}>Close</Button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        {!rows ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No QR codes yet" subtitle="QR codes are generated automatically when you create a landing page with 'Generate QR' checked." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>QR Code</Th>
                <Th>Linked To</Th>
                <Th>Scans</Th>
                <Th>Installs</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((q) => (
                <tr key={q.id}>
                  <Td className="font-mono text-xs">QR-{q.id.slice(-6).toUpperCase()}</Td>
                  <Td>{q.linkedLabel}</Td>
                  <Td className="font-mono">{num(q.scans)}</Td>
                  <Td className="font-mono">{num(q.installs)}</Td>
                  <Td><StatusBadge status={q.status} /></Td>
                  <Td className="flex gap-2">
                    <Button variant="secondary" onClick={() => viewQr(q.id)}>View / Download</Button>
                    {q.status === "Active" && (
                      <Button variant="secondary" onClick={() => api.post(`/landing-pages/qr-codes/${q.id}/disable`).then(load)}>Disable</Button>
                    )}
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
