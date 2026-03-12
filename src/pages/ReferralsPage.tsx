import { useMemo } from "react";
import { DataTable } from "../components/DataTable";
import { EmptyState, SectionCard, StatusBadge } from "../components/UI";
import { CRMData } from "../types";

interface ReferralsPageProps {
  data: CRMData;
  loading: boolean;
  error: string;
  configured: boolean;
}

const statusLabel = (status: string) => {
  if (status === "Pending") return "대기";
  if (status === "Approved") return "승인";
  if (status === "Reward issued") return "보상 지급";
  return "보상 사용";
};

export function ReferralsPage({ data, loading, error, configured }: ReferralsPageProps) {
  const rows = useMemo(
    () =>
      data.referrals.map((referral) => ({
        id: referral.id,
        referrerName: data.participants.find((item) => item.id === referral.referrerParticipantId)?.name ?? "알 수 없음",
        referredName: data.participants.find((item) => item.id === referral.referredParticipantId)?.name ?? "알 수 없음",
        eventName: data.events.find((item) => item.id === referral.eventId)?.name ?? "이벤트 미연결",
        status: referral.referralStatus,
        rewardType: referral.rewardType,
        rewardIssued: referral.rewardIssued,
        rewardUsed: referral.rewardUsed,
      })),
    [data],
  );

  return (
    <SectionCard title="추천 추적" description="Supabase에 저장된 추천 관계를 조회합니다.">
      {!configured ? <EmptyState title="Supabase 연결 필요" description="연결 후 추천 관계를 조회할 수 있습니다." /> : null}
      {loading ? <p>추천 데이터를 불러오는 중입니다.</p> : null}
      {error ? <p>{error}</p> : null}
      {!loading && configured && rows.length > 0 ? (
        <DataTable
          rows={rows}
          rowKey={(row) => row.id}
          columns={[
            { key: "referrer", label: "추천인", sortable: true, sortValue: (row) => row.referrerName, render: (row) => <strong>{row.referrerName}</strong> },
            { key: "referred", label: "추천받은 참여자", sortable: true, sortValue: (row) => row.referredName, render: (row) => row.referredName },
            { key: "event", label: "이벤트", sortable: true, sortValue: (row) => row.eventName, render: (row) => row.eventName },
            { key: "status", label: "상태", render: (row) => <StatusBadge status={statusLabel(row.status)} /> },
            { key: "reward", label: "보상 유형", render: (row) => row.rewardType || "-" },
            { key: "issued", label: "지급 / 사용", render: (row) => `${row.rewardIssued ? "지급" : "미지급"} / ${row.rewardUsed ? "사용" : "미사용"}` },
          ]}
        />
      ) : null}
      {!loading && configured && rows.length === 0 ? <EmptyState title="추천 데이터 없음" description="참여자 입력 후 추천 관계를 추가하면 이곳에 표시됩니다." /> : null}
    </SectionCard>
  );
}
