import { useEffect, useMemo, useState, useTransition } from "react";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { EventsPage } from "./pages/EventsPage";
import { ImportPage } from "./pages/ImportPage";
import { ParticipantsPage } from "./pages/ParticipantsPage";
import { ReferralsPage } from "./pages/ReferralsPage";
import { RewardsPage } from "./pages/RewardsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { fetchCRMData, isSupabaseConfigured } from "./lib/database";
import { CRMData, PageKey } from "./types";

const emptyData: CRMData = {
  participants: [],
  events: [],
  participations: [],
  referrals: [],
  rewards: [],
  importHistory: [],
};

const pageCopy: Record<PageKey, { title: string; subtitle: string }> = {
  dashboard: {
    title: "대시보드",
    subtitle: "Supabase에 저장된 참여자, 이벤트, 추천, 리워드 데이터를 한눈에 봅니다.",
  },
  participants: {
    title: "참여자",
    subtitle: "실제 참여자 데이터를 검색하고 새 참여자를 직접 등록합니다.",
  },
  events: {
    title: "이벤트",
    subtitle: "이벤트 현황을 확인하고 새 이벤트를 등록합니다.",
  },
  referrals: {
    title: "추천",
    subtitle: "추천 관계와 보상 상태를 실제 데이터 기준으로 추적합니다.",
  },
  rewards: {
    title: "리워드/할인",
    subtitle: "추천 보상과 할인 사용 상태를 관리합니다.",
  },
  imports: {
    title: "CSV 업로드",
    subtitle: "CSV 사전 검증 흐름을 점검하고 이후 Supabase 적재로 확장할 수 있습니다.",
  },
  settings: {
    title: "설정",
    subtitle: "Supabase 연결 정보와 테이블 스키마 적용 방법을 확인합니다.",
  },
};

function App() {
  const [page, setPage] = useState<PageKey>("dashboard");
  const [data, setData] = useState<CRMData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const configured = useMemo(() => isSupabaseConfigured(), []);
  const copy = useMemo(() => pageCopy[page], [page]);

  const loadData = async () => {
    if (!configured) {
      setData(emptyData);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const nextData = await fetchCRMData();
      startTransition(() => {
        setData(nextData);
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Supabase 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [configured]);

  return (
    <Layout page={page} onPageChange={setPage} title={copy.title} subtitle={copy.subtitle}>
      {page === "dashboard" ? <DashboardPage data={data} loading={loading || isPending} error={error} configured={configured} /> : null}
      {page === "participants" ? <ParticipantsPage data={data} loading={loading || isPending} error={error} configured={configured} onRefresh={loadData} /> : null}
      {page === "events" ? <EventsPage data={data} loading={loading || isPending} error={error} configured={configured} onRefresh={loadData} /> : null}
      {page === "referrals" ? <ReferralsPage data={data} loading={loading || isPending} error={error} configured={configured} /> : null}
      {page === "rewards" ? <RewardsPage data={data} loading={loading || isPending} error={error} configured={configured} /> : null}
      {page === "imports" ? <ImportPage data={data} configured={configured} /> : null}
      {page === "settings" ? <SettingsPage configured={configured} /> : null}
    </Layout>
  );
}

export default App;
