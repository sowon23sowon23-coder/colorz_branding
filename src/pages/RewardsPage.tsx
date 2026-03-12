import { useMemo } from "react";
import { DataTable } from "../components/DataTable";
import { EmptyState, SectionCard, StatCard, StatusBadge } from "../components/UI";
import { CRMData } from "../types";
import { formatDate } from "../utils";

interface RewardsPageProps {
  data: CRMData;
  loading: boolean;
  error: string;
  configured: boolean;
}

const rewardLabel = (status: string) => {
  if (status === "Available") return "사용 가능";
  if (status === "Issued") return "지급 완료";
  if (status === "Used") return "사용 완료";
  return "만료";
};

export function RewardsPage({ data, loading, error, configured }: RewardsPageProps) {
  const rows = useMemo(
    () =>
      data.rewards.map((reward) => ({
        ...reward,
        participantName: data.participants.find((item) => item.id === reward.participantId)?.name ?? "알 수 없음",
        eventName: data.events.find((item) => item.id === reward.relatedEventId)?.name ?? "이벤트 미연결",
      })),
    [data],
  );

  return (
    <div className="page-grid">
      <div className="stat-grid compact">
        <StatCard label="사용 가능" value={rows.filter((row) => row.rewardStatus === "Available").length} helper="지금 적용 가능한 보상" />
        <StatCard label="지급 완료" value={rows.filter((row) => row.rewardStatus === "Issued").length} helper="지급 후 미사용 보상" />
        <StatCard label="사용 완료" value={rows.filter((row) => row.rewardStatus === "Used").length} helper="실제 사용이 끝난 보상" />
      </div>
      <SectionCard title="리워드 목록" description="Supabase 기준 리워드/할인 데이터를 보여줍니다.">
        {!configured ? <EmptyState title="Supabase 연결 필요" description="연결 후 리워드 데이터를 조회할 수 있습니다." /> : null}
        {loading ? <p>리워드 데이터를 불러오는 중입니다.</p> : null}
        {error ? <p>{error}</p> : null}
        {!loading && configured && rows.length > 0 ? (
          <DataTable
            rows={rows}
            rowKey={(row) => row.id}
            columns={[
              { key: "participant", label: "참여자", sortable: true, sortValue: (row) => row.participantName, render: (row) => <strong>{row.participantName}</strong> },
              { key: "type", label: "보상 유형", render: (row) => row.rewardType },
              { key: "status", label: "상태", render: (row) => <StatusBadge status={rewardLabel(row.rewardStatus)} /> },
              { key: "issuedAt", label: "지급일", sortable: true, sortValue: (row) => row.issuedAt ?? "", render: (row) => row.issuedAt ? formatDate(row.issuedAt) : "-" },
              { key: "usedAt", label: "사용일", sortable: true, sortValue: (row) => row.usedAt ?? "", render: (row) => row.usedAt ? formatDate(row.usedAt) : "-" },
              { key: "event", label: "관련 이벤트", render: (row) => row.eventName },
            ]}
          />
        ) : null}
        {!loading && configured && rows.length === 0 ? <EmptyState title="리워드 데이터 없음" description="추천과 보상 기록이 추가되면 이곳에 표시됩니다." /> : null}
      </SectionCard>
    </div>
  );
}
