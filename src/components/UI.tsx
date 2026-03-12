import { ReactNode } from "react";

export function StatCard({ label, value, helper }: { label: string; value: string | number; helper: string }) {
  return (
    <section className="card stat-card">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{helper}</span>
    </section>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="card section-card">
      <div className="section-head">
        <div>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status.includes("Used") || status.includes("사용") || status === "Attended" || status === "참석"
      ? "success"
      : status.includes("Pending") || status.includes("대기") || status === "Applied" || status === "신청"
        ? "warning"
        : status.includes("Approved") ||
            status.includes("Issued") ||
            status.includes("Organic") ||
            status.includes("승인") ||
            status.includes("지급") ||
            status.includes("일반")
          ? "info"
          : status.includes("No-show") || status.includes("Expired") || status.includes("노쇼") || status.includes("만료")
            ? "danger"
            : "neutral";

  return <span className={`badge ${tone}`}>{status}</span>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty-state">
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
}

export function Drawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-head">
          <h3>{title}</h3>
          <button className="ghost-button" onClick={onClose}>
            닫기
          </button>
        </div>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>
  );
}

export function MiniBarChart({
  items,
  valueLabel,
}: {
  items: { label: string; value: number }[];
  valueLabel?: string;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="chart-list">
      {items.map((item) => (
        <div key={item.label} className="chart-row">
          <div className="chart-meta">
            <span>{item.label}</span>
            <strong>
              {item.value}
              {valueLabel ? ` ${valueLabel}` : ""}
            </strong>
          </div>
          <div className="chart-track">
            <div className="chart-fill" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
