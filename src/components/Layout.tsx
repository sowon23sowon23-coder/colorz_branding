import { ReactNode } from "react";
import { PageKey } from "../types";

const navItems: { key: PageKey; label: string; description: string }[] = [
  { key: "dashboard", label: "대시보드", description: "CRM 핵심 지표" },
  { key: "participants", label: "참여자", description: "참여자 목록과 등록" },
  { key: "events", label: "이벤트", description: "이벤트 목록과 등록" },
  { key: "referrals", label: "추천", description: "추천 관계 추적" },
  { key: "rewards", label: "리워드/할인", description: "보상 상태 확인" },
  { key: "imports", label: "CSV 업로드", description: "CSV 검증 흐름" },
  { key: "settings", label: "설정", description: "Supabase 연결 안내" },
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
            <p>대학 마케팅 동아리 관리자</p>
          </div>
        </div>
        <nav className="nav-list" aria-label="사이드바 내비게이션">
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
            <p className="eyebrow">Colorz 내부 운영</p>
            <h2>{title}</h2>
            <p className="subtitle">{subtitle}</p>
          </div>
          <div className="topbar-actions">
            <div className="pill">Supabase 연동 모드</div>
            <div className="pill secondary">실데이터 입력 가능</div>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
