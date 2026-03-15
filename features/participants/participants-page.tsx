"use client";

import { useMemo, useState } from "react";
import { Upload } from "lucide-react";

import { useAppData } from "@/components/app-data-provider";
import { DataTable } from "@/components/data-table";
import { DetailDrawer } from "@/components/detail-drawer";
import { EmptyState } from "@/components/empty-state";
import { FilterBar } from "@/components/filter-bar";
import { PageHeader } from "@/components/page-header";
import { Badge, Button, Card, CardContent, Input } from "@/components/ui";
import { getParticipantDetail, listParticipants } from "@/lib/repository";
import { formatDate } from "@/lib/utils";
import type { Participant } from "@/types";

export function ParticipantsPage() {
  const { db } = useAppData();
  const [filters, setFilters] = useState<{ query: string; segment: "all" | "first-time" | "repeat" | "has-referrer" | "invited-friends" | "inactive" }>({ query: "", segment: "all" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[]>([]);

  const participants = useMemo(() => listParticipants(db, filters), [db, filters]);
  const detail = selectedId ? getParticipantDetail(db, selectedId) : undefined;

  const handleCsv = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      setCsvPreview(text.split(/\r?\n/).slice(0, 4));
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <PageHeader
        eyebrow="CRM"
        title="참가자 CRM"
        description="신규, 재참여, 추천 유입, 휴면 참가자를 빠르게 필터링하고 개인별 이력과 메모를 확인합니다."
        actions={
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
            <Upload className="h-4 w-4" />CSV 업로드
            <input type="file" accept=".csv" className="hidden" onChange={(event) => handleCsv(event.target.files?.[0])} />
          </label>
        }
      />

      <FilterBar>
        <Input placeholder="이름, 이메일, 태그 검색" value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} className="max-w-sm" />
        <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={filters.segment} onChange={(event) => setFilters((current) => ({ ...current, segment: event.target.value as typeof filters.segment }))}>
          <option value="all">전체</option>
          <option value="first-time">첫 참가</option>
          <option value="repeat">재참여</option>
          <option value="has-referrer">추천인 있음</option>
          <option value="invited-friends">친구 초대 경험</option>
          <option value="inactive">최근 30일 비활성</option>
        </select>
      </FilterBar>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="p-6">
            {participants.length === 0 ? (
              <EmptyState title="조건에 맞는 참가자가 없습니다" description="검색어나 세그먼트 필터를 조정해 주세요." />
            ) : (
              <DataTable
                headers={["참가자", "참여 이력", "추천/초대", "태그", "메모"]}
                rows={participants.map((participant) => [
                  <button key={`${participant.id}-name`} className="text-left" onClick={() => setSelectedId(participant.id)}>
                    <div className="font-medium text-slate-900">{participant.name}</div>
                    <div className="text-xs text-slate-500">{participant.email}</div>
                  </button>,
                  <div key={`${participant.id}-history`} className="text-sm text-slate-600">첫 참여 {formatDate(participant.firstJoinDate)}<br />최근 참여 {formatDate(participant.lastJoinDate)}<br />총 {participant.totalParticipations}회</div>,
                  <div key={`${participant.id}-ref`} className="text-sm text-slate-600">추천인 {participant.referrerName || "-"}<br />초대한 친구 {participant.invitedFriendsCount}명</div>,
                  <div key={`${participant.id}-tags`} className="flex flex-wrap gap-2">{participant.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>,
                  participant.notes,
                ])}
              />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-lg font-semibold text-slate-900">운영 세그먼트 가이드</div>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <div><span className="font-medium text-slate-900">VIP</span> 후기/추천 확률이 높아 사전 초대 리스트에 포함</div>
                <div><span className="font-medium text-slate-900">Repeat</span> 다음 행사 유형 실험의 안정적인 베이스로 활용</div>
                <div><span className="font-medium text-slate-900">Inactive</span> 최근 30일 미참여자는 콘텐츠형 리마인드 우선</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-lg font-semibold text-slate-900">CSV 미리보기</div>
              <div className="mt-3 space-y-2 text-sm text-slate-500">
                {csvPreview.length === 0 ? <div>업로드된 CSV가 없습니다.</div> : csvPreview.map((line, index) => <div key={index} className="rounded-xl bg-slate-50 px-3 py-2 font-mono text-xs">{line}</div>)}
              </div>
              <div className="mt-4 text-xs text-slate-500">현재는 프런트엔드 미리보기만 동작하며 실제 저장은 하지 않습니다.</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <DetailDrawer open={Boolean(detail)} onClose={() => setSelectedId(null)} title={detail?.participant.name || "참가자 상세"} description={detail ? `${detail.participant.email} · ${detail.participant.phone}` : undefined}>
        {detail ? (
          <div className="space-y-6">
            <Section title="프로필 정보">
              <div className="space-y-2 text-sm text-slate-600">
                <div>첫 참여일: {formatDate(detail.participant.firstJoinDate)}</div>
                <div>최근 참여일: {formatDate(detail.participant.lastJoinDate)}</div>
                <div>총 참여: {detail.participant.totalParticipations}회</div>
                <div>추천인: {detail.participant.referrerName || "없음"}</div>
              </div>
            </Section>
            <Section title="참여 이벤트 이력">
              <div className="space-y-3">{detail.joinedEvents.map((event) => <div key={event.id} className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600"><div className="font-medium text-slate-900">{event.title}</div><div className="mt-1">{formatDate(event.date)} · {event.location}</div></div>)}</div>
            </Section>
            <Section title="태그와 메모">
              <div className="flex flex-wrap gap-2">{detail.participant.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
              <div className="mt-3 text-sm leading-6 text-slate-600">{detail.participant.notes}</div>
            </Section>
            <Section title="설문/리퍼럴 힌트">
              <div className="space-y-3">{detail.surveys.map((survey) => <div key={survey.id} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">만족도 {survey.satisfactionScore}/5 · {survey.comment}</div>)}</div>
            </Section>
          </div>
        ) : null}
      </DetailDrawer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</div>
      {children}
    </section>
  );
}

