"use client";

import { useMemo, useState } from "react";
import { KanbanSquare, List, Plus } from "lucide-react";

import { useAppData } from "@/components/app-data-provider";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { FilterBar } from "@/components/filter-bar";
import { PageHeader } from "@/components/page-header";
import { Badge, Button, Card, CardContent, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input, Textarea } from "@/components/ui";
import { listTasks } from "@/lib/repository";
import { formatDate } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types";

const columns: TaskStatus[] = ["todo", "in-progress", "done"];

export function TasksPage() {
  const { db, saveTaskItem, deleteTaskItem } = useAppData();
  const [view, setView] = useState<"list" | "kanban">("list");
  const [filters, setFilters] = useState<{ status: TaskStatus | "all"; eventId: string | "all" }>({ status: "all", eventId: "all" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Task>({ id: `tsk-${Date.now()}`, title: "", description: "", relatedEventId: undefined, assignee: "", dueDate: "2026-03-18", priority: "medium", status: "todo" });

  const tasks = useMemo(() => listTasks(db, filters), [db, filters]);

  return (
    <div>
      <PageHeader
        eyebrow="Tasks"
        title="운영 태스크"
        description="이벤트 준비 업무를 리스트와 칸반 보드로 동시에 관리합니다."
        actions={<Button onClick={() => { setForm({ id: `tsk-${Date.now()}`, title: "", description: "", relatedEventId: undefined, assignee: "", dueDate: "2026-03-18", priority: "medium", status: "todo" }); setDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" />태스크 생성</Button>}
      />

      <FilterBar>
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          <button className={`rounded-lg px-3 py-2 text-sm ${view === "list" ? "bg-slate-900 text-white" : "text-slate-500"}`} onClick={() => setView("list")}><List className="mr-2 inline h-4 w-4" />List</button>
          <button className={`rounded-lg px-3 py-2 text-sm ${view === "kanban" ? "bg-slate-900 text-white" : "text-slate-500"}`} onClick={() => setView("kanban")}><KanbanSquare className="mr-2 inline h-4 w-4" />Kanban</button>
        </div>
        <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as TaskStatus | "all" }))}>
          <option value="all">전체 상태</option><option value="todo">todo</option><option value="in-progress">in-progress</option><option value="done">done</option>
        </select>
        <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={filters.eventId} onChange={(event) => setFilters((current) => ({ ...current, eventId: event.target.value }))}>
          <option value="all">전체 이벤트</option>
          {db.events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
        </select>
      </FilterBar>

      {tasks.length === 0 ? <EmptyState title="태스크가 없습니다" description="새 태스크를 생성하거나 필터를 변경해 주세요." /> : null}

      {tasks.length > 0 && view === "list" ? (
        <Card>
          <CardContent className="p-6">
            <DataTable
              headers={["태스크", "이벤트", "담당", "마감", "우선순위", "상태", ""]}
              rows={tasks.map((task) => [
                <div key={`${task.id}-title`}><div className="font-medium text-slate-900">{task.title}</div><div className="text-xs text-slate-500">{task.description}</div></div>,
                db.events.find((event) => event.id === task.relatedEventId)?.title || "-",
                task.assignee,
                formatDate(task.dueDate),
                <Badge key={`${task.id}-priority`} variant={task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "default"}>{task.priority}</Badge>,
                <Badge key={`${task.id}-status`} variant={task.status === "done" ? "success" : task.status === "in-progress" ? "warning" : "default"}>{task.status}</Badge>,
                <div key={`${task.id}-actions`} className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => { setForm(task); setDialogOpen(true); }}>수정</Button><Button variant="ghost" size="sm" onClick={() => deleteTaskItem(task.id)}>삭제</Button></div>,
              ])}
            />
          </CardContent>
        </Card>
      ) : null}

      {tasks.length > 0 && view === "kanban" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {columns.map((column) => (
            <Card key={column}>
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-lg font-semibold text-slate-900">{column}</div>
                  <Badge>{tasks.filter((task) => task.status === column).length}</Badge>
                </div>
                <div className="space-y-3">
                  {tasks.filter((task) => task.status === column).map((task) => (
                    <div key={task.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                      <div className="font-medium text-slate-900">{task.title}</div>
                      <div className="mt-2 text-sm text-slate-500">{task.description}</div>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>{task.assignee}</span><span>{formatDate(task.dueDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>태스크 저장</DialogTitle>
            <DialogDescription>이벤트와 연결된 운영 업무를 관리합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="태스크명" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            <Input placeholder="담당자" value={form.assignee} onChange={(event) => setForm((current) => ({ ...current, assignee: event.target.value }))} />
            <Input type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
            <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as Task["priority"] }))}>
              <option value="low">low</option><option value="medium">medium</option><option value="high">high</option>
            </select>
            <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as TaskStatus }))}>
              <option value="todo">todo</option><option value="in-progress">in-progress</option><option value="done">done</option>
            </select>
            <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={form.relatedEventId ?? ""} onChange={(event) => setForm((current) => ({ ...current, relatedEventId: event.target.value || undefined }))}>
              <option value="">이벤트 연결 안 함</option>
              {db.events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
            </select>
          </div>
          <Textarea className="mt-3" placeholder="설명" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>취소</Button>
            <Button onClick={() => { saveTaskItem(form); setDialogOpen(false); }}>저장</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

