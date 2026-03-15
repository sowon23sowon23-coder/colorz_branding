"use client";

import { useMemo, useState } from "react";
import { Calendar, Edit3, Plus, Trash2, Users } from "lucide-react";

import { useAppData } from "@/components/app-data-provider";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { FilterBar } from "@/components/filter-bar";
import { PageHeader } from "@/components/page-header";
import { ChartCard } from "@/components/chart-card";
import { Badge, Button, Card, CardContent, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input, Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from "@/components/ui";
import { createEvent as createEventRecord, getEventDetail, listEvents } from "@/lib/repository";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Event, EventStatus, EventType } from "@/types";

const emptyEvent: Omit<Event, "id"> = {
  title: "",
  date: "2026-03-20",
  location: "",
  type: "networking",
  status: "planning",
  targetParticipants: 30,
  actualParticipants: 0,
  description: "",
  foodItems: [],
  entryFee: 10000,
  totalCost: 0,
  totalRevenue: 0,
  owner: "",
  notes: "",
  participantIds: [],
  surveyResultIds: [],
  hypothesisIds: [],
  reflection: "",
};

export function EventsPage() {
  const { db, createEventItem, updateEventItem, deleteEventItem, saveHypothesisItem } = useAppData();
  const [filters, setFilters] = useState<{ query: string; status: EventStatus | "all"; type: EventType | "all" }>({ query: "", status: "all", type: "all" });
  const [selectedId, setSelectedId] = useState(db.events[0]?.id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<Omit<Event, "id">>(emptyEvent);
  const [hypothesisForm, setHypothesisForm] = useState({ title: "", description: "", successCriteria: "", actualResult: "", success: false, improvementNotes: "" });

  const events = useMemo(() => listEvents(db, filters), [db, filters]);
  const selected = getEventDetail(db, selectedId || events[0]?.id || "");

  const openCreate = () => {
    setEditingEvent(null);
    setForm(emptyEvent);
    setDialogOpen(true);
  };

  const openEdit = (event: Event) => {
    setEditingEvent(event);
    setForm({ ...event, foodItems: event.foodItems });
    setDialogOpen(true);
  };

  const saveEvent = () => {
    const payload = { ...form, foodItems: typeof form.foodItems === "string" ? String(form.foodItems).split(",").map((item) => item.trim()).filter(Boolean) : form.foodItems } as Omit<Event, "id">;
    if (editingEvent) {
      updateEventItem({ ...editingEvent, ...payload });
    } else {
      createEventItem(payload);
    }
    setDialogOpen(false);
  };

  const saveHypothesis = () => {
    if (!selected) return;
    saveHypothesisItem({ ...hypothesisForm, eventId: selected.event.id });
    setHypothesisForm({ title: "", description: "", successCriteria: "", actualResult: "", success: false, improvementNotes: "" });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Events"
        title="이벤트 운영 관리"
        description="이벤트별 운영 상태, 가설, 참가자, 설문 결과, 회고를 한 흐름으로 관리합니다."
        actions={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />이벤트 생성</Button>}
      />

      <FilterBar>
        <Input placeholder="이벤트명, 장소, 담당자 검색" value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} className="max-w-sm" />
        <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as EventStatus | "all" }))}>
          <option value="all">전체 상태</option>
          <option value="planning">planning</option>
          <option value="preparing">preparing</option>
          <option value="completed">completed</option>
          <option value="analyzed">analyzed</option>
        </select>
        <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={filters.type} onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value as EventType | "all" }))}>
          <option value="all">전체 유형</option>
          <option value="networking">networking</option>
          <option value="food">food</option>
          <option value="career">career</option>
          <option value="workshop">workshop</option>
          <option value="social">social</option>
        </select>
      </FilterBar>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.2fr]">
        <ChartCard title="이벤트 리스트" description="상태와 유형으로 필터링한 운영 이벤트">
          {events.length === 0 ? (
            <EmptyState title="이벤트가 없습니다" description="새 이벤트를 생성하거나 필터를 조정해 주세요." />
          ) : (
            <DataTable
              headers={["이벤트", "일정", "상태", "참여", "작업"]}
              rows={events.map((event) => [
                <button key={`${event.id}-select`} className="text-left" onClick={() => setSelectedId(event.id)}>
                  <div className="font-medium text-slate-900">{event.title}</div>
                  <div className="text-xs text-slate-500">{event.location}</div>
                </button>,
                <div key={`${event.id}-date`} className="text-sm text-slate-600">{formatDate(event.date)}</div>,
                <Badge key={`${event.id}-status`} variant={event.status === "analyzed" ? "success" : event.status === "completed" ? "info" : "warning"}>{event.status}</Badge>,
                `${event.actualParticipants}/${event.targetParticipants}`,
                <div key={`${event.id}-actions`} className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(event)}><Edit3 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteEventItem(event.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>,
              ])}
            />
          )}
        </ChartCard>

        {selected ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="info">{selected.event.type}</Badge>
                    <Badge variant={selected.event.status === "analyzed" ? "success" : "warning"}>{selected.event.status}</Badge>
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-950">{selected.event.title}</h2>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(selected.event.date)}</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" />{selected.event.actualParticipants}명 참여</span>
                  </div>
                </div>
                <Button variant="secondary" onClick={() => openEdit(selected.event)}>기본 정보 수정</Button>
              </div>

              <Tabs defaultValue="basic">
                <TabsList className="mt-5 flex w-full flex-wrap gap-1 bg-transparent p-0">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="hypotheses">Hypotheses</TabsTrigger>
                  <TabsTrigger value="participants">Participants</TabsTrigger>
                  <TabsTrigger value="survey">Survey Results</TabsTrigger>
                  <TabsTrigger value="reflection">Reflection</TabsTrigger>
                </TabsList>
                <TabsContent value="basic">
                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoBlock label="장소" value={selected.event.location} />
                    <InfoBlock label="담당" value={selected.event.owner} />
                    <InfoBlock label="참가비" value={formatCurrency(selected.event.entryFee)} />
                    <InfoBlock label="예상 수익" value={formatCurrency(selected.event.totalRevenue - selected.event.totalCost)} />
                    <InfoBlock label="음식" value={selected.event.foodItems.join(", ")} />
                    <InfoBlock label="설명" value={selected.event.description} />
                  </div>
                </TabsContent>
                <TabsContent value="hypotheses">
                  <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-4">
                      {selected.hypotheses.map((hypothesis) => (
                        <div key={hypothesis.id} className="rounded-2xl border border-slate-200 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-medium text-slate-900">{hypothesis.title}</div>
                            <Badge variant={hypothesis.success ? "success" : "warning"}>{hypothesis.success ? "success" : "pending"}</Badge>
                          </div>
                          <div className="mt-2 text-sm leading-6 text-slate-500">{hypothesis.description}</div>
                          <div className="mt-3 text-sm"><span className="font-medium text-slate-900">성공 기준:</span> {hypothesis.successCriteria}</div>
                          <div className="mt-1 text-sm"><span className="font-medium text-slate-900">실제 결과:</span> {hypothesis.actualResult}</div>
                          <div className="mt-1 text-sm"><span className="font-medium text-slate-900">개선 메모:</span> {hypothesis.improvementNotes}</div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/60 p-4">
                      <div className="text-lg font-semibold text-slate-900">가설 추가</div>
                      <div className="mt-4 space-y-3">
                        <Input placeholder="가설 제목" value={hypothesisForm.title} onChange={(event) => setHypothesisForm((current) => ({ ...current, title: event.target.value }))} />
                        <Textarea placeholder="설명" value={hypothesisForm.description} onChange={(event) => setHypothesisForm((current) => ({ ...current, description: event.target.value }))} />
                        <Input placeholder="성공 기준" value={hypothesisForm.successCriteria} onChange={(event) => setHypothesisForm((current) => ({ ...current, successCriteria: event.target.value }))} />
                        <Textarea placeholder="실제 결과" value={hypothesisForm.actualResult} onChange={(event) => setHypothesisForm((current) => ({ ...current, actualResult: event.target.value }))} />
                        <Textarea placeholder="개선 메모" value={hypothesisForm.improvementNotes} onChange={(event) => setHypothesisForm((current) => ({ ...current, improvementNotes: event.target.value }))} />
                        <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={hypothesisForm.success} onChange={(event) => setHypothesisForm((current) => ({ ...current, success: event.target.checked }))} />성공 여부 확정</label>
                        <Button onClick={saveHypothesis}>가설 저장</Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="participants">
                  <div className="grid gap-3 md:grid-cols-2">
                    {selected.participants.map((participant) => (
                      <div key={participant.id} className="rounded-2xl border border-slate-200 p-4">
                        <div className="font-medium text-slate-900">{participant.name}</div>
                        <div className="mt-1 text-sm text-slate-500">{participant.email}</div>
                        <div className="mt-3 flex flex-wrap gap-2">{participant.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
                        <div className="mt-3 text-sm text-slate-600">참여 횟수 {participant.totalParticipations}회</div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="survey">
                  <div className="space-y-3">
                    {selected.surveys.map((survey) => (
                      <div key={survey.id} className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium text-slate-900">{db.participants.find((participant) => participant.id === survey.participantId)?.name}</div>
                          <Badge variant="info">만족도 {survey.satisfactionScore}/5</Badge>
                        </div>
                        <div className="mt-2 text-sm leading-6 text-slate-500">{survey.comment}</div>
                        <div className="mt-2 text-xs text-slate-500">재참여 {survey.rejoinIntent ? "의향 있음" : "의향 낮음"} · 추천 {survey.recommendIntent ? "의향 있음" : "의향 낮음"}</div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="reflection">
                  <div className="rounded-3xl bg-[#f6efe3] p-5 text-sm leading-7 text-slate-700">{selected.event.reflection || "아직 회고가 입력되지 않았습니다."}</div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <EmptyState title="선택된 이벤트가 없습니다" description="왼쪽 리스트에서 이벤트를 선택해 상세 정보를 확인하세요." />
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? "이벤트 수정" : "이벤트 생성"}</DialogTitle>
            <DialogDescription>기본 정보와 운영 수치를 입력하세요.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="이벤트명" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            <Input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
            <Input placeholder="장소" value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} />
            <Input placeholder="담당자" value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} />
            <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as EventType }))}>
              <option value="networking">networking</option><option value="food">food</option><option value="career">career</option><option value="workshop">workshop</option><option value="social">social</option>
            </select>
            <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as EventStatus }))}>
              <option value="planning">planning</option><option value="preparing">preparing</option><option value="completed">completed</option><option value="analyzed">analyzed</option>
            </select>
            <Input type="number" placeholder="목표 참가자" value={form.targetParticipants} onChange={(event) => setForm((current) => ({ ...current, targetParticipants: Number(event.target.value) }))} />
            <Input type="number" placeholder="실제 참가자" value={form.actualParticipants} onChange={(event) => setForm((current) => ({ ...current, actualParticipants: Number(event.target.value) }))} />
            <Input type="number" placeholder="참가비" value={form.entryFee} onChange={(event) => setForm((current) => ({ ...current, entryFee: Number(event.target.value) }))} />
            <Input type="number" placeholder="총비용" value={form.totalCost} onChange={(event) => setForm((current) => ({ ...current, totalCost: Number(event.target.value) }))} />
            <Input type="number" placeholder="총수익" value={form.totalRevenue} onChange={(event) => setForm((current) => ({ ...current, totalRevenue: Number(event.target.value) }))} />
            <Input placeholder="음식 항목 (콤마 구분)" value={Array.isArray(form.foodItems) ? form.foodItems.join(", ") : String(form.foodItems)} onChange={(event) => setForm((current) => ({ ...current, foodItems: event.target.value.split(",") }))} />
          </div>
          <Textarea className="mt-3" placeholder="설명" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          <Textarea className="mt-3" placeholder="운영 메모" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>취소</Button>
            <Button onClick={saveEvent}>저장</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-sm leading-6 text-slate-800">{value}</div>
    </div>
  );
}

