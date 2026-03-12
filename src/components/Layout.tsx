import { ReactNode } from "react";
import { PageKey } from "../types";

const navItems: { key: PageKey; label: string; description: string }[] = [
  { key: "dashboard", label: "Dashboard", description: "CRM performance overview" },
  { key: "participants", label: "Participants", description: "All member profiles and history" },
  { key: "events", label: "Events", description: "Gathering operations and outcomes" },
  { key: "referrals", label: "Referrals", description: "Friend invites and approval status" },
  { key: "rewards", label: "Rewards/Discounts", description: "Reward inventory and usage" },
  { key: "imports", label: "CSV Import", description: "Bulk upload and data validation" },
  { key: "settings", label: "Settings", description: "Policies and admin configuration" },
];

interface LayoutProps {
  page: PageKey;
  onPageChange: (page: PageKey) => void;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function Layout({ page, onPageChange, title, subtitle, children }: LayoutProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">C</div>
          <div>
            <h1>Colorz CRM</h1>
            <p>University marketing club admin</p>
          </div>
        </div>
        <nav className="nav-list" aria-label="Sidebar navigation">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${page === item.key ? "active" : ""}`}
              onClick={() => onPageChange(item.key)}
            >
              <span>{item.label}</span>
              <small>{item.description}</small>
            </button>
          ))}
        </nav>
      </aside>
      <div className="content-shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">Colorz internal operations</p>
            <h2>{title}</h2>
            <p className="subtitle">{subtitle}</p>
          </div>
          <div className="topbar-actions">
            <div className="pill">Spring cycle active</div>
            <div className="pill secondary">6 admins online</div>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
