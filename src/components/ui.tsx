import React from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--ink)]">{title}</h1>
        {subtitle && <p className="text-sm text-[var(--muted)] mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[var(--paper-card)] border border-[var(--line)] rounded-xl ${className}`}>{children}</div>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  accent = "violet",
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "violet" | "teal" | "amber" | "coral";
}) {
  const dot = { violet: "bg-[var(--violet)]", teal: "bg-[var(--teal)]", amber: "bg-[var(--amber)]", coral: "bg-[var(--coral)]" }[accent];
  return (
    <Card className="p-4">
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <span className="text-[11px] uppercase tracking-wide text-[var(--muted)] font-semibold">{label}</span>
      </div>
      <div className="font-mono text-2xl font-semibold text-[var(--ink)]">{value}</div>
      {hint && <div className="text-xs text-[var(--muted)] mt-1">{hint}</div>}
    </Card>
  );
}

const statusStyles: Record<string, string> = {
  Active: "bg-[var(--teal-dim)] text-[var(--teal)]",
  Approved: "bg-[var(--teal-dim)] text-[var(--teal)]",
  Completed: "bg-[var(--teal-dim)] text-[var(--teal)]",
  Paid: "bg-[var(--teal-dim)] text-[var(--teal)]",
  Valid: "bg-[var(--teal-dim)] text-[var(--teal)]",
  Legitimate: "bg-[var(--teal-dim)] text-[var(--teal)]",
  Converted: "bg-[var(--teal-dim)] text-[var(--teal)]",

  Pending: "bg-[var(--amber-dim)] text-[var(--amber)]",
  Processing: "bg-[var(--amber-dim)] text-[var(--amber)]",
  Investigating: "bg-[var(--amber-dim)] text-[var(--amber)]",
  "Awaiting Subscription": "bg-[var(--amber-dim)] text-[var(--amber)]",

  Rejected: "bg-[var(--coral-dim)] text-[var(--coral)]",
  Suspended: "bg-[var(--coral-dim)] text-[var(--coral)]",
  Banned: "bg-[var(--coral-dim)] text-[var(--coral)]",
  Failed: "bg-[var(--coral-dim)] text-[var(--coral)]",
  Invalid: "bg-[var(--coral-dim)] text-[var(--coral)]",
  Flagged: "bg-[var(--coral-dim)] text-[var(--coral)]",
  "Confirmed Fraud": "bg-[var(--coral-dim)] text-[var(--coral)]",
  Lost: "bg-[var(--coral-dim)] text-[var(--coral)]",
  Expired: "bg-[var(--coral-dim)] text-[var(--coral)]",
  Disabled: "bg-[var(--coral-dim)] text-[var(--coral)]",

  HIGH: "bg-[var(--coral-dim)] text-[var(--coral)]",
  MEDIUM: "bg-[var(--amber-dim)] text-[var(--amber)]",
  LOW: "bg-[var(--teal-dim)] text-[var(--teal)]",
};

export function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || "bg-[var(--violet-dim)] text-[var(--violet)]";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${style}`}>
      {status}
    </span>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "sm",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost"; size?: "sm" | "md" }) {
  const base = "inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = { sm: "px-2.5 py-1.5 text-[12.5px]", md: "px-4 py-2 text-sm" };
  const variants = {
    primary: "bg-[var(--violet)] text-white hover:bg-[#b03d82]",
    secondary: "bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--violet-dim)]",
    danger: "bg-[var(--coral)] text-white hover:opacity-90",
    ghost: "text-[var(--muted)] hover:text-[var(--ink)]",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center py-16 text-[var(--muted)]">
      <div className="font-display font-semibold text-[var(--ink)]">{title}</div>
      {subtitle && <div className="text-sm mt-1">{subtitle}</div>}
    </div>
  );
}

export function Loading() {
  return <div className="py-16 text-center text-sm text-[var(--muted)]">Loading…</div>;
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="py-8 px-4 bg-[var(--coral-dim)] text-[var(--coral)] rounded-lg text-sm">
      Couldn&apos;t load this: {message}. Make sure the backend is running on port 4000.
    </div>
  );
}

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13.5px]">{children}</table>
    </div>
  );
}

export function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wide text-[var(--muted)] font-semibold border-b border-[var(--line)]">
      {children}
    </th>
  );
}

export function Td({
  children,
  className = "",
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-4 py-2.5 border-b border-[var(--line)] ${className}`} {...props}>
      {children}
    </td>
  );
}
