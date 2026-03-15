"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { useAppData } from "@/components/app-data-provider";
import { EmptyState } from "@/components/empty-state";
import { FilterBar } from "@/components/filter-bar";
import { PageHeader } from "@/components/page-header";
import { Badge, Button, Card, CardContent, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input, Textarea } from "@/components/ui";
import { listMeetingNotes } from "@/lib/repository";
import { formatDate } from "@/lib/utils";
import type { MeetingNote } from "@/types";

export function MeetingNotesPage() {
  const { db, saveMeetingNoteItem, deleteMeetingNoteItem } = useAppData();
  const [filters, setFilters] = useState({ query: "", eventId: "all" });
  const [selected, setSelected] = useState<MeetingNote | null>(db.meetingNotes[0] ?? null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<MeetingNote>({ id: `note-${Date.now()}`, title: "", date: "2026-03-15", attendees: [], relatedEventId: undefined, content: "", decisions: [], actionItems: [] });

  const notes = useMemo(() => listMeetingNotes(db, filters), [db, filters]);

  return (
    <div>
      <PageHeader eyebrow="Meeting Notes" title="회의 노트" description="운영 회의의 내용, 결정, 액션 아이템을 이벤트와 연결해 누적 자산으로 남깁니다." actions={<Button onClick={() => { setForm({ id: `note-${Date.now()}`, title: "", date: "2026-03-15", attendees: [], relatedEventId: undefined, content: "", decisions: [], actionItems: [] }); setDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" />노트 작성</Button>} />

      <FilterBar>
        <Input placeholder="회의 제목 검색" value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} className="max-w-sm" />
        <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={filters.eventId} onChange={(event) => setFilters((current) => ({ ...current, eventId: event.target.value }))}>
          <option value="all">전체 이벤트</option>
          {db.events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
        </select>
      </FilterBar>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.15fr]">
        <Card>
          <CardContent className="p-6">
            {notes.length === 0 ? <EmptyState title="회의 노트가 없습니다" description="검색 필터를 조정하거나 새 노트를 작성하세요." /> : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <button key={note.id} className="w-full rounded-2xl border border-slate-200 p-4 text-left hover:bg-slate-50" onClick={() => setSelected(note)}>
                    <div className="font-medium text-slate-900">{note.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{formatDate(note.date)} · {note.attendees.join(", ")}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-600 line-clamp-2">{note.content}</div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {selected ? (
          <Card>
            <CardContent className="space-y-6 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-slate-500">{formatDate(selected.date)}</div>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">{selected.title}</h2>
                  <div className="mt-2 flex flex-wrap gap-2">{selected.attendees.map((attendee) => <Badge key={attendee}>{attendee}</Badge>)}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => { setForm(selected); setDialogOpen(true); }}>수정</Button>
                  <Button variant="destructive" onClick={() => { deleteMeetingNoteItem(selected.id); setSelected(null); }}>삭제</Button>
                </div>
              </div>
              <Section title="회의 내용">{selected.content}</Section>
              <Section title="주요 결정">
                <ul className="space-y-2 text-sm leading-6 text-slate-600">{selected.decisions.map((item, index) => <li key={index}>? {item}</li>)}</ul>
              </Section>
              <Section title="액션 아이템">
                <ul className="space-y-2 text-sm leading-6 text-slate-600">{selected.actionItems.map((item, index) => <li key={index}>? {item}</li>)}</ul>
              </Section>
            </CardContent>
          </Card>
        ) : <EmptyState title="노트를 선택하세요" description="왼쪽 리스트에서 회의 노트를 선택하면 상세 내용을 볼 수 있습니다." />}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>회의 노트 저장</DialogTitle>
            <DialogDescription>회의 내용을 구조화해 기록합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="제목" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            <Input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
            <Input className="md:col-span-2" placeholder="참석자 (콤마 구분)" value={form.attendees.join(", ")} onChange={(event) => setForm((current) => ({ ...current, attendees: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) }))} />
            <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm md:col-span-2" value={form.relatedEventId ?? ""} onChange={(event) => setForm((current) => ({ ...current, relatedEventId: event.target.value || undefined }))}>
              <option value="">이벤트 연결 안 함</option>
              {db.events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
            </select>
          </div>
          <Textarea className="mt-3" placeholder="회의 내용" value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} />
          <Textarea className="mt-3" placeholder="결정 사항 (줄바꿈 구분)" value={form.decisions.join("\n")} onChange={(event) => setForm((current) => ({ ...current, decisions: event.target.value.split(/\r?\n/).filter(Boolean) }))} />
          <Textarea className="mt-3" placeholder="액션 아이템 (줄바꿈 구분)" value={form.actionItems.join("\n")} onChange={(event) => setForm((current) => ({ ...current, actionItems: event.target.value.split(/\r?\n/).filter(Boolean) }))} />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>취소</Button>
            <Button onClick={() => { saveMeetingNoteItem(form); setDialogOpen(false); }}>저장</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</div>
      <div className="rounded-2xl bg-slate-50/80 p-4 text-sm leading-7 text-slate-700">{children}</div>
    </div>
  );
}

