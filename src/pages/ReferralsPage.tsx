import { useMemo } from "react";
import { DataTable } from "../components/DataTable";
import { SectionCard, StatusBadge } from "../components/UI";
import { CRMData } from "../types";

export function ReferralsPage({ data }: { data: CRMData }) {
  const rows = useMemo(
    () =>
      data.referrals.map((referral) => {
        const referrer = data.participants.find((item) => item.id === referral.referrerParticipantId);
        const referred = data.participants.find((item) => item.id === referral.referredParticipantId);
        const event = data.events.find((item) => item.id === referral.eventId);
        return {
          id: referral.id,
          referrerName: referrer?.name ?? "Unknown",
          referredName: referred?.name ?? "Unknown",
          eventName: event?.name ?? "Unlinked event",
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
      title="Referral tracking"
      description="Track who invited whom, approval status, and reward fulfillment"
      action={<button className="primary-button">Add referral record</button>}
    >
      <DataTable
        rows={rows}
        rowKey={(row) => row.id}
        columns={[
          { key: "referrer", label: "Referrer", sortable: true, sortValue: (row) => row.referrerName, render: (row) => <strong>{row.referrerName}</strong> },
          { key: "referred", label: "Referred friend", sortable: true, sortValue: (row) => row.referredName, render: (row) => row.referredName },
          { key: "event", label: "Related event", sortable: true, sortValue: (row) => row.eventName, render: (row) => row.eventName },
          { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
          { key: "reward", label: "Reward type", render: (row) => row.rewardType },
          { key: "issued", label: "Issued / used", render: (row) => `${row.rewardIssued ? "Issued" : "Not issued"} / ${row.rewardUsed ? "Used" : "Unused"}` },
        ]}
      />
    </SectionCard>
  );
}
