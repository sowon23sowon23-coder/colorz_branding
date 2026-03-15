"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useAppData } from "@/components/app-data-provider";
import { ChartCard } from "@/components/chart-card";
import { EmptyState } from "@/components/empty-state";
import { FilterBar } from "@/components/filter-bar";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui";
import { buildEventTypeComparison, buildKeywordFrequency, buildMonthlyTrends, calculateAverageSatisfaction, calculateIntentRatio, calculateReferralInflow, calculateRepeatParticipationRate } from "@/lib/metrics";
import { getAnalyticsSnapshot, parseSurveyCsv } from "@/lib/repository";
import { formatMonth } from "@/lib/utils";

const pieColors = ["#1f3b2f", "#c59c64", "#8eb69b", "#e49c74", "#7c88c5"];

export function AnalyticsPage() {
  const { db } = useAppData();
  const [filters, setFilters] = useState<{ eventId: string | "all"; dateRange: "3m" | "6m" | "12m" | "all" }>({ eventId: "all", dateRange: "6m" });
  const [csvPreview, setCsvPreview] = useState<string[]>([]);

  const snapshot = useMemo(() => getAnalyticsSnapshot(db, filters), [db, filters]);
  const keywordData = buildKeywordFrequency(snapshot.surveys);
  const eventTypeComparison = buildEventTypeComparison({ ...db, events: snapshot.events });
  const monthly = buildMonthlyTrends({ ...db, events: snapshot.events }, filters.dateRange === "all" ? 6 : Number(filters.dateRange.replace("m", "")));

  return (
    <div>
      <PageHeader eyebrow="Analytics" title="애널리틱스" description="이벤트 수, 참가자 추이, 만족도, 추천/재참여 의향, 이벤트 유형별 성과를 분석합니다." />

      <FilterBar>
        <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={filters.eventId} onChange={(event) => setFilters((current) => ({ ...current, eventId: event.target.value }))}>
          <option value="all">전체 이벤트</option>
          {db.events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
        </select>
        <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={filters.dateRange} onChange={(event) => setFilters((current) => ({ ...current, dateRange: event.target.value as typeof filters.dateRange }))}>
          <option value="3m">최근 3개월</option><option value="6m">최근 6개월</option><option value="12m">최근 12개월</option><option value="all">전체</option>
        </select>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
          설문 CSV 업로드
          <input type="file" accept=".csv" className="hidden" onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              const parsed = parseSurveyCsv(String(reader.result || ""));
              setCsvPreview(parsed.slice(0, 4).map((item) => `${item.eventId} / ${item.participantId} / ${item.satisfactionScore}`));
            };
            reader.readAsText(file);
          }} />
        </label>
      </FilterBar>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="선택 이벤트 수" value={String(snapshot.events.length)} helper="필터 기준" />
        <StatCard label="재참여율" value={`${calculateRepeatParticipationRate({ ...db, participants: snapshot.participants })}%`} helper="필터 이벤트 참가자 기준" />
        <StatCard label="추천 유입" value={String(calculateReferralInflow({ ...db, participants: snapshot.participants }))} helper="추천인 기록 보유" />
        <StatCard label="평균 만족도" value={String(calculateAverageSatisfaction(snapshot.surveys))} helper="설문 응답 평균" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ChartCard title="월별 이벤트/참가자 추이" description="필터 기준 추세 비교">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly.map((item) => ({ ...item, label: formatMonth(item.month) }))}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="events" fill="#1f3b2f" radius={[8, 8, 0, 0]} />
                <Bar dataKey="participants" fill="#c59c64" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="이벤트 유형 비교" description="유형별 평균 참가 인원">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={eventTypeComparison} dataKey="value" nameKey="label" outerRadius={110} innerRadius={55} paddingAngle={3}>
                  {eventTypeComparison.map((item, index) => <Cell key={item.label} fill={pieColors[index % pieColors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard title="참여 의향 분석" description="설문 기반 재참여/추천 의향">
          {snapshot.surveys.length === 0 ? (
            <EmptyState title="설문 데이터가 없습니다" description="선택한 필터에서 설문 응답이 없어서 그래프를 그릴 수 없습니다." />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <MetricBlock label="재참여 의향" value={`${calculateIntentRatio(snapshot.surveys, "rejoinIntent")}%`} />
              <MetricBlock label="추천 의향" value={`${calculateIntentRatio(snapshot.surveys, "recommendIntent")}%`} />
              <MetricBlock label="응답 수" value={`${snapshot.surveys.length}건`} />
            </div>
          )}
        </ChartCard>
        <Card>
          <CardContent className="p-6">
            <div className="text-lg font-semibold text-slate-900">코멘트 키워드 빈도</div>
            <div className="mt-4 space-y-3">
              {keywordData.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-sm text-slate-600"><span>{item.label}</span><span>{item.value}</span></div>
                  <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-[#1f3b2f]" style={{ width: `${Math.min(item.value * 18, 100)}%` }} /></div>
                </div>
              ))}
              {keywordData.length === 0 ? <div className="text-sm text-slate-500">표시할 코멘트가 없습니다.</div> : null}
            </div>
            <div className="mt-6 text-lg font-semibold text-slate-900">CSV 업로드 미리보기</div>
            <div className="mt-3 space-y-2">{csvPreview.length === 0 ? <div className="text-sm text-slate-500">업로드된 설문 CSV가 없습니다.</div> : csvPreview.map((item, index) => <div key={index} className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">{item}</div>)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-5"><div className="text-sm text-slate-500">{label}</div><div className="mt-3 text-3xl font-semibold text-slate-950">{value}</div></div>;
}

