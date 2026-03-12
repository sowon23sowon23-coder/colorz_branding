import { useMemo } from "react";
import { DataTable } from "../components/DataTable";
import { SectionCard, StatusBadge, StatCard } from "../components/UI";
import { CRMData } from "../types";
import { formatDate } from "../utils";

const rewardLabel = (status: string) => {
  if (status === "Available") return "사용 가능";
  if (status === "Issued") return "지급 완료";
  if (status === "Used") return "사용 완료";
  return "만료";
};

export function RewardsPage({ data }: { data: CRMData }) {
  const rows = useMemo(
    () =>
      data.rewards.map((reward) => {
        const participant = data.participants.find((item) => item.id === reward.participantId);
        const event = data.events.find((item) => item.id === reward.relatedEventId);
        return {
          ...reward,
          participantName: participant?.name ?? "알 수 없음",
          eventName: event?.name ?? "관련 이벤트 없음",
        };
      }),
    [data],
  );

  return (
    <div className="page-grid">
      <div className="stat-grid compact">
        <StatCard label="사용 가능 리워드" value={rows.filter((row) => row.rewardStatus === "Available").length} helper="다음 이벤트에 적용 가능" />
        <StatCard label="지급 완료 리워드" value={rows.filter((row) => row.rewardStatus === "Issued").length} helper="지급되었지만 아직 미사용" />
        <StatCard label="사용 완료 리워드" value={rows.filter((row) => row.rewardStatus === "Used").length} helper="실제 사용이 끝난 혜택" />
      </div>
      <SectionCard title="리워드 및 할인" description="추천과 이벤트에 연결된 보상 기록을 유연하게 관리합니다">
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
      </SectionCard>
    </div>
  );
}
