import { useMemo } from "react";
import { DataTable } from "../components/DataTable";
import { SectionCard, StatusBadge } from "../components/UI";
import { CRMData } from "../types";

const referralStatusLabel = (status: string) => {
  if (status === "Pending") return "대기";
  if (status === "Approved") return "승인";
  if (status === "Reward issued") return "보상 지급";
  return "보상 사용";
};

export function ReferralsPage({ data }: { data: CRMData }) {
  const rows = useMemo(
    () =>
      data.referrals.map((referral) => {
        const referrer = data.participants.find((item) => item.id === referral.referrerParticipantId);
        const referred = data.participants.find((item) => item.id === referral.referredParticipantId);
        const event = data.events.find((item) => item.id === referral.eventId);
        return {
          id: referral.id,
          referrerName: referrer?.name ?? "알 수 없음",
          referredName: referred?.name ?? "알 수 없음",
          eventName: event?.name ?? "연결되지 않은 이벤트",
          status: referral.referralStatus,
          rewardType: referral.rewardType,
          rewardIssued: referral.rewardIssued,
          rewardUsed: referral.rewardUsed,
        };
      }),
    [data],
  );

  return (
    <SectionCard
      title="추천 추적"
      description="누가 누구를 초대했는지, 승인 상태와 보상 지급 여부를 추적합니다"
      action={<button className="primary-button">추천 기록 추가</button>}
    >
      <DataTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={[
          { key: "referrer", label: "추천인", sortable: true, sortValue: (row) => row.referrerName, render: (row) => <strong>{row.referrerName}</strong> },
          { key: "referred", label: "초대받은 친구", sortable: true, sortValue: (row) => row.referredName, render: (row) => row.referredName },
          { key: "event", label: "연결 이벤트", sortable: true, sortValue: (row) => row.eventName, render: (row) => row.eventName },
          { key: "status", label: "상태", render: (row) => <StatusBadge status={referralStatusLabel(row.status)} /> },
          { key: "reward", label: "보상 유형", render: (row) => row.rewardType },
          { key: "issued", label: "지급 / 사용", render: (row) => `${row.rewardIssued ? "지급됨" : "미지급"} / ${row.rewardUsed ? "사용됨" : "미사용"}` },
        ]}
      />
    </SectionCard>
  );
}
