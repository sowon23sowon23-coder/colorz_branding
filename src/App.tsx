import { useMemo, useState } from "react";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { EventsPage } from "./pages/EventsPage";
import { ImportPage } from "./pages/ImportPage";
import { ParticipantsPage } from "./pages/ParticipantsPage";
import { ReferralsPage } from "./pages/ReferralsPage";
import { RewardsPage } from "./pages/RewardsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { crmData } from "./mockData";
import { PageKey } from "./types";

const pageCopy: Record<PageKey, { title: string; subtitle: string }> = {
  dashboard: { title: "대시보드", subtitle: "참여자 증가, 추천 성과, 재참여율, 이벤트 상태를 한눈에 확인합니다." },
  participants: { title: "참여자", subtitle: "전체 CRM에서 사람을 검색하고 이력을 검토하며 상세 프로필을 확인합니다." },
  events: { title: "이벤트", subtitle: "이벤트별 수요, 참석 품질, 노쇼, 만족도 반응을 확인합니다." },
  referrals: { title: "추천", subtitle: "친구 초대 관계, 승인 진행 상태, 리워드 결과를 추적합니다." },
  rewards: { title: "리워드/할인", subtitle: "지급된 혜택, 예정 할인, 사용 완료 상태를 관리합니다." },
  imports: { title: "CSV 업로드", subtitle: "구글폼 CSV와 운영 데이터를 매핑, 미리보기, 중복 감지와 함께 불러옵니다." },
  settings: { title: "설정", subtitle: "추천 보상 규칙, 운영 메모, 확장 포인트를 정리합니다." },
};

function App() {
  const [page, setPage] = useState<PageKey>("dashboard");
  const copy = useMemo(() => pageCopy[page], [page]);

  return (
    <Layout page={page} onPageChange={setPage} title={copy.title} subtitle={copy.subtitle}>
      {page === "dashboard" ? <DashboardPage data={crmData} /> : null}
      {page === "participants" ? <ParticipantsPage data={crmData} /> : null}
      {page === "events" ? <EventsPage data={crmData} /> : null}
      {page === "referrals" ? <ReferralsPage data={crmData} /> : null}
      {page === "rewards" ? <RewardsPage data={crmData} /> : null}
      {page === "imports" ? <ImportPage data={crmData} /> : null}
      {page === "settings" ? <SettingsPage /> : null}
    </Layout>
  );
}

export default App;
