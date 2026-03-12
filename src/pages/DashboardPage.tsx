import { CRMData } from "../types";
import { getDashboardStats, getEventSummaries, getParticipantSummaries, groupCount } from "../utils";
import { MiniBarChart, SectionCard, StatCard } from "../components/UI";

export function DashboardPage({ data }: { data: CRMData }) {
  const stats = getDashboardStats(data);
  const events = getEventSummaries(data);
  const participants = getParticipantSummaries(data);

  const newVsReturning = [
    { label: "첫 참여", value: participants.filter((entry) => entry.totalParticipationCount === 1).length },
    { label: "재참여", value: participants.filter((entry) => entry.totalParticipationCount > 1).length },
  ];
  const referralTrend = events.map((event) => ({ label: event.name, value: event.referralParticipantCount }));
  const schoolDistribution = groupCount(data.participants.map((entry) => entry.school)).slice(0, 5);
  const topicDistribution = groupCount(data.events.map((entry) => entry.topic));

  return (
    <div className="page-grid">
      <div className="stat-grid">
        <StatCard label="전체 참여자" value={stats.totalParticipants} helper="이벤트 전체 기준 고유 프로필 수" />
        <StatCard label="이번 달 신규" value={stats.newParticipantsThisMonth} helper="2026년 3월 첫 참여자" />
        <StatCard label="전체 이벤트" value={stats.totalEvents} helper="CRM에 등록된 모임 수" />
        <StatCard label="평균 참석률" value={`${stats.averageAttendanceRate}%`} helper="신청 대비 실제 참석 비율" />
        <StatCard label="재참여율" value={`${stats.repeatParticipationRate}%`} helper="2회 이상 참여자 비율" />
        <StatCard label="추천 유입" value={stats.referralInflowCount} helper="친구 초대로 유입된 참여자" />
        <StatCard label="리워드 사용" value={stats.rewardUsageCount} helper="할인 또는 혜택 사용 완료 수" />
      </div>

      <div className="two-column-grid">
        <SectionCard title="이벤트별 참석자 수" description="이벤트별 신청, 참석, 노쇼 흐름을 빠르게 확인합니다">
          <MiniBarChart items={events.map((event) => ({ label: event.name, value: event.actualAttendeeCount }))} valueLabel="명" />
        </SectionCard>
        <SectionCard title="신규 vs 재참여 비율" description="유입과 유지의 균형을 비교합니다">
          <MiniBarChart items={newVsReturning} valueLabel="명" />
        </SectionCard>
        <SectionCard title="추천 유입 추이" description="모임별 친구 초대 기여도를 확인합니다">
          <MiniBarChart items={referralTrend} valueLabel="건" />
        </SectionCard>
        <SectionCard title="학교 분포" description="CRM 내 상위 학교 분포입니다">
          <MiniBarChart items={schoolDistribution} valueLabel="명" />
        </SectionCard>
        <SectionCard title="인기 이벤트 주제" description="수요를 만든 주제 분포입니다">
          <MiniBarChart items={topicDistribution} valueLabel="회" />
        </SectionCard>
        <SectionCard title="운영 인사이트" description="학생 운영진이 바로 해석할 수 있는 요약입니다">
          <ul className="insight-list">
            <li>{events[0]?.name}의 최근 참석 성과가 가장 높아 반복 운영 포맷 후보로 적합합니다.</li>
            <li>{schoolDistribution[0]?.label} 유입이 가장 강하므로 타깃 재참여 캠페인 우선 대상입니다.</li>
            <li>{participants.filter((entry) => entry.invitedFriendsCount > 0).length}명이 실제 추천 활동 중이므로 빠른 보상 지급이 필요합니다.</li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
