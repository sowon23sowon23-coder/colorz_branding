import { useMemo } from "react";
import { DataTable } from "../components/DataTable";
import { SectionCard, StatusBadge, StatCard } from "../components/UI";
import { CRMData } from "../types";
import { formatDate } from "../utils";

export function RewardsPage({ data }: { data: CRMData }) {
  const rows = useMemo(
    () =>
      data.rewards.map((reward) => {
        const participant = data.participants.find((item) => item.id === reward.participantId);
        const event = data.events.find((item) => item.id === reward.relatedEventId);
        return {
          ...reward,
          participantName: participant?.name ?? "Unknown",
          eventName: event?.name ?? "No related event",
        };
      }),
    [data],
  );

  return (
    <div className="page-grid">
      <div className="stat-grid compact">
        <StatCard label="Available rewards" value={rows.filter((row) => row.rewardStatus === "Available").length} helper="Ready to apply on next event" />
        <StatCard label="Issued rewards" value={rows.filter((row) => row.rewardStatus === "Issued").length} helper="Granted but not yet consumed" />
        <StatCard label="Used rewards" value={rows.filter((row) => row.rewardStatus === "Used").length} helper="Successfully redeemed benefits" />
      </div>
      <SectionCard title="Rewards and discounts" description="Flexible reward records tied to referrals and events">
        <DataTable
          rows={rows}
          rowKey={(row) => row.id}
          columns={[
            { key: "participant", label: "Participant", sortable: true, sortValue: (row) => row.participantName, render: (row) => <strong>{row.participantName}</strong> },
            { key: "type", label: "Reward type", render: (row) => row.rewardType },
            { key: "status", label: "Status", render: (row) => <StatusBadge status={row.rewardStatus} /> },
            { key: "issuedAt", label: "Issued", sortable: true, sortValue: (row) => row.issuedAt ?? "", render: (row) => row.issuedAt ? formatDate(row.issuedAt) : "-" },
            { key: "usedAt", label: "Used", sortable: true, sortValue: (row) => row.usedAt ?? "", render: (row) => row.usedAt ? formatDate(row.usedAt) : "-" },
            { key: "event", label: "Related event", render: (row) => row.eventName },
          ]}
        />
      </SectionCard>
    </div>
  );
}
