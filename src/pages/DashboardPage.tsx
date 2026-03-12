import { CRMData } from "../types";
import { getDashboardStats, getEventSummaries, getParticipantSummaries, groupCount } from "../utils";
import { EmptyState, MiniBarChart, SectionCard, StatCard } from "../components/UI";

interface DashboardPageProps {
  data: CRMData;
  loading: boolean;
  error: string;
  configured: boolean;
}

export function DashboardPage({ data, loading, error, configured }: DashboardPageProps) {
  if (!configured) {
    return (
      <SectionCard title="Supabase 연결 필요" description="환경변수와 테이블을 먼저 설정해야 대시보드가 동작합니다.">
        <EmptyState title="연결 전 상태" description="`.env`에 Supabase URL과 anon key를 넣고 `supabase/schema.sql`을 실행하세요." />
      </SectionCard>
    );
  }

  if (loading) {
    return (
      <SectionCard title="데이터 불러오는 중" description="Supabase에서 CRM 데이터를 읽고 있습니다.">
        <p>잠시만 기다려 주세요.</p>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard title="데이터 로드 실패" description="Supabase 조회 중 오류가 발생했습니다.">
        <p>{error}</p>
      </SectionCard>
    );
  }

  if (data.participants.length === 0 && data.events.length === 0) {
    return (
      <SectionCard title="아직 입력된 데이터가 없습니다" description="참여자와 이벤트를 먼저 등록하면 대시보드가 채워집니다.">
        <EmptyState title="빈 CRM" description="참여자 페이지와 이벤트 페이지에서 새 데이터를 직접 입력해 주세요." />
      </SectionCard>
    );
  }

  const stats = getDashboardStats(data);
  const events = getEventSummaries(data);
  const participants = getParticipantSummaries(data);
  const newVsReturning = [
    { label: "첫 참여", value: participants.filter((entry) => entry.totalParticipationCount <= 1).length },
    { label: "재참여", value: participants.filter((entry) => entry.totalParticipationCount > 1).length },
  ];
  const referralTrend = events.map((event) => ({ label: event.name, value: event.referralParticipantCount }));
  const schoolDistribution = groupCount(data.participants.map((entry) => entry.school || "미입력")).slice(0, 5);
  const topicDistribution = groupCount(data.events.map((entry) => entry.topic || "미분류"));

  return (
    <div className="page-grid">
      <div className="stat-grid">
        <StatCard label="전체 참여자" value={stats.totalParticipants} helper="고유 참여자 수" />
        <StatCard label="이번 달 신규" value={stats.newParticipantsThisMonth} helper="이번 달 첫 참여자" />
        <StatCard label="전체 이벤트" value={stats.totalEvents} helper="등록된 모임 수" />
        <StatCard label="평균 참석률" value={`${stats.averageAttendanceRate}%`} helper="신청 대비 참석" />
        <StatCard label="재참여율" value={`${stats.repeatParticipationRate}%`} helper="2회 이상 참여자 비율" />
        <StatCard label="추천 유입" value={stats.referralInflowCount} helper="추천으로 들어온 참여자" />
        <StatCard label="리워드 사용" value={stats.rewardUsageCount} helper="사용 완료된 보상 수" />
      </div>

      <div className="two-column-grid">
        <SectionCard title="이벤트별 참석자 수" description="이벤트별 실제 참석자 현황입니다.">
          <MiniBarChart items={events.map((event) => ({ label: event.name, value: event.actualAttendeeCount }))} valueLabel="명" />
        </SectionCard>
        <SectionCard title="신규 vs 재참여" description="유입과 재참여 비중을 비교합니다.">
          <MiniBarChart items={newVsReturning} valueLabel="명" />
        </SectionCard>
        <SectionCard title="추천 유입 추이" description="이벤트별 추천 기여도를 봅니다.">
          <MiniBarChart items={referralTrend} valueLabel="건" />
        </SectionCard>
        <SectionCard title="학교 분포" description="현재 CRM에 가장 많이 쌓인 학교입니다.">
          <MiniBarChart items={schoolDistribution} valueLabel="명" />
        </SectionCard>
        <SectionCard title="인기 주제" description="이벤트 주제 분포입니다.">
          <MiniBarChart items={topicDistribution} valueLabel="회" />
        </SectionCard>
        <SectionCard title="운영 메모" description="데이터가 쌓이면 이 영역을 캠페인 판단 기준으로 활용할 수 있습니다.">
          <ul className="insight-list">
            <li>참여자와 이벤트를 먼저 입력하면 이후 참석/추천/리워드 흐름을 확장할 수 있습니다.</li>
            <li>CSV 업로드는 현재 프론트 검증 중심이며, 실제 저장은 Supabase 연결 후 확장 가능합니다.</li>
            <li>추천과 리워드는 데이터가 들어오는 즉시 이 대시보드에 반영됩니다.</li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
