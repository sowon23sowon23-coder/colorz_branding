"use client";

import { useMemo, useState } from "react";
import { Save } from "lucide-react";

import { useAppData } from "@/components/app-data-provider";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Badge, Button, Card, CardContent, Input } from "@/components/ui";
import { calculateFeeDraft } from "@/lib/metrics";
import { formatCurrency, formatDate } from "@/lib/utils";

export function FeeCalculatorPage() {
  const { db, saveFeeCalculationItem } = useAppData();
  const [form, setForm] = useState({ eventId: db.events[0]?.id, expectedParticipants: 36, foodCost: 220000, venueCost: 60000, extraCost: 30000, targetProfit: 120000 });

  const draft = useMemo(() => calculateFeeDraft(form), [form]);

  return (
    <div>
      <PageHeader eyebrow="Fee Calculator" title="회비 계산기" description="예상 참가자 수와 비용 구조를 기준으로 손익분기 회비와 권장 회비를 계산합니다." />
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="text-lg font-semibold text-slate-900">입력값</div>
            <select className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" value={form.eventId} onChange={(event) => setForm((current) => ({ ...current, eventId: event.target.value }))}>
              {db.events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
            </select>
            <Input type="number" value={form.expectedParticipants} onChange={(event) => setForm((current) => ({ ...current, expectedParticipants: Number(event.target.value) }))} placeholder="예상 참가자" />
            <Input type="number" value={form.foodCost} onChange={(event) => setForm((current) => ({ ...current, foodCost: Number(event.target.value) }))} placeholder="식비" />
            <Input type="number" value={form.venueCost} onChange={(event) => setForm((current) => ({ ...current, venueCost: Number(event.target.value) }))} placeholder="대관비" />
            <Input type="number" value={form.extraCost} onChange={(event) => setForm((current) => ({ ...current, extraCost: Number(event.target.value) }))} placeholder="기타 비용" />
            <Input type="number" value={form.targetProfit} onChange={(event) => setForm((current) => ({ ...current, targetProfit: Number(event.target.value) }))} placeholder="목표 이익" />
            <Button onClick={() => saveFeeCalculationItem(draft)}><Save className="mr-2 h-4 w-4" />계산 저장</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="text-lg font-semibold text-slate-900">계산 결과</div>
            <div className="grid gap-4 md:grid-cols-2">
              <ResultBlock label="총 비용" value={formatCurrency(draft.totalCost)} />
              <ResultBlock label="1인당 실제 비용" value={formatCurrency(draft.perPersonCost)} />
              <ResultBlock label="손익분기 회비" value={formatCurrency(draft.breakEvenFee)} />
              <ResultBlock label="권장 회비" value={formatCurrency(draft.recommendedFee)} />
            </div>
            <div className="rounded-[1.5rem] bg-[#183028] p-5 text-white">
              <div className="text-sm text-white/70">추천 가이드</div>
              <div className="mt-2 text-lg font-semibold">권장 회비는 {formatCurrency(draft.recommendedFee)}입니다.</div>
              <div className="mt-2 text-sm text-white/70">비용 회수와 목표 이익을 동시에 맞추려면 최소 {form.expectedParticipants}명 기준으로 이 금액이 필요합니다.</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-slate-900">저장된 계산 이력</div>
                <div className="text-sm text-slate-500">이벤트 연결 포함</div>
              </div>
              <Badge>{db.feeCalculations.length}건</Badge>
            </div>
            <DataTable
              headers={["이벤트", "예상 참가자", "총 비용", "손익분기", "권장 회비", "저장일"]}
              rows={db.feeCalculations.map((item) => [
                db.events.find((event) => event.id === item.eventId)?.title || "수동 계산",
                `${item.expectedParticipants}명`,
                formatCurrency(item.totalCost),
                formatCurrency(item.breakEvenFee),
                formatCurrency(item.recommendedFee),
                formatDate(item.createdAt),
              ])}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ResultBlock({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200 p-5"><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-3xl font-semibold text-slate-950">{value}</div></div>;
}

