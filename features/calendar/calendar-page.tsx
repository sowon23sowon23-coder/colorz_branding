"use client";

import { useMemo, useState } from "react";
import { addDays, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from "date-fns";
import { Plus } from "lucide-react";

import { useAppData } from "@/components/app-data-provider";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge, Button, Card, CardContent, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input, Textarea } from "@/components/ui";
import { listScheduleItems } from "@/lib/repository";
import { cn, formatDate } from "@/lib/utils";
import type { ScheduleItem, ScheduleType } from "@/types";

const typeStyles: Record<ScheduleType, string> = {
  event: "bg-emerald-100 text-emerald-800",
  meeting: "bg-sky-100 text-sky-800",
  preparation: "bg-amber-100 text-amber-800",
  surveyDeadline: "bg-rose-100 text-rose-800",
  promotion: "bg-violet-100 text-violet-800",
};

export function CalendarPage() {
  const { db, saveScheduleItem, deleteScheduleItemById } = useAppData();
  const [currentDate] = useState(new Date("2026-03-15T12:00:00"));
  const [selected, setSelected] = useState<ScheduleItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ScheduleItem>({ id: "sch-new", title: "", date: "2026-03-15", time: "18:00", type: "meeting", relatedEventId: undefined, owner: "", notes: "" });

  const items = listScheduleItems(db);
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const start = startOfWeek(monthStart, { weekStartsOn: 0 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const calendarDays = [];
    let day = start;
    while (day <= end) {
      const iso = format(day, "yyyy-MM-dd");
      calendarDays.push({
        date: iso,
        isCurrentMonth: format(day, "M") === format(currentDate, "M"),
        items: items.filter((item) => item.date === iso),
      });
      day = addDays(day, 1);
    }
    return calendarDays;
  }, [currentDate, items]);

  const openCreate = () => {
    setForm({ id: `sch-${Date.now()}`, title: "", date: "2026-03-15", time: "18:00", type: "meeting", relatedEventId: undefined, owner: "", notes: "" });
    setDialogOpen(true);
  };

  return (
    <div>
      <PageHeader eyebrow="Calendar" title="운영 캘린더" description="행사, 회의, 준비 일정, 설문 마감, 홍보 일정을 월간 캘린더에서 확인합니다." actions={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />일정 추가</Button>} />
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 text-2xl font-semibold text-slate-950">2026년 3월</div>
          <div className="grid grid-cols-7 gap-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => <div key={label}>{label}</div>)}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-7">
            {days.map((day) => (
              <div key={day.date} className={cn("min-h-[180px] rounded-[1.5rem] border p-3", day.isCurrentMonth ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50/50")}>
                <div className="mb-3 text-sm font-semibold text-slate-900">{format(new Date(day.date), "d")}</div>
                <div className="space-y-2">
                  {day.items.map((item) => (
                    <button key={item.id} className={cn("w-full rounded-xl px-3 py-2 text-left text-xs font-medium", typeStyles[item.type])} onClick={() => setSelected(item)}>
                      <div>{item.time} · {item.title}</div>
                    </button>
                  ))}
                  {day.items.length === 0 ? <div className="text-xs text-slate-400">일정 없음</div> : null}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>일정 저장</DialogTitle>
            <DialogDescription>운영 일정을 추가하거나 수정합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="제목" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            <Input placeholder="담당자" value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} />
            <Input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
            <Input type="time" value={form.time} onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))} />
            <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm md:col-span-2" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as ScheduleType }))}>
              <option value="event">gathering event</option>
              <option value="meeting">meeting</option>
              <option value="preparation">preparation</option>
              <option value="surveyDeadline">survey deadline</option>
              <option value="promotion">promotion schedule</option>
            </select>
          </div>
          <Textarea className="mt-3" placeholder="메모" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>취소</Button>
            <Button onClick={() => { saveScheduleItem(form); setDialogOpen(false); }}>저장</Button>
          </div>
        </DialogContent>
      </Dialog>

      {selected ? (
        <div className="mt-6">
          <Card>
            <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2"><Badge className={typeStyles[selected.type]}>{selected.type}</Badge></div>
                <div className="mt-3 text-2xl font-semibold text-slate-950">{selected.title}</div>
                <div className="mt-2 text-sm text-slate-500">{formatDate(selected.date)} · {selected.time} · {selected.owner}</div>
                <div className="mt-3 text-sm leading-6 text-slate-600">{selected.notes}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => { setForm(selected); setDialogOpen(true); }}>수정</Button>
                <Button variant="destructive" onClick={() => { deleteScheduleItemById(selected.id); setSelected(null); }}>삭제</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="mt-6"><EmptyState title="일정을 선택하세요" description="캘린더 항목을 클릭하면 상세 내용을 확인할 수 있습니다." /></div>
      )}
    </div>
  );
}

