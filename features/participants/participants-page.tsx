"use client";

import { useMemo, useState } from "react";
import { Edit3, Plus, Upload } from "lucide-react";

import { useAppData } from "@/components/app-data-provider";
import { DataTable } from "@/components/data-table";
import { DetailDrawer } from "@/components/detail-drawer";
import { EmptyState } from "@/components/empty-state";
import { FilterBar } from "@/components/filter-bar";
import { PageHeader } from "@/components/page-header";
import { Badge, Button, Card, CardContent, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input, Textarea } from "@/components/ui";
import { getParticipantDetail, listParticipants } from "@/lib/repository";
import { formatDate } from "@/lib/utils";
import type { Participant } from "@/types";

const today = new Date().toISOString().slice(0, 10);

const emptyParticipant: Participant = {
  id: "new-participant",
  name: "",
  email: "",
  phone: "",
  firstJoinDate: today,
  lastJoinDate: today,
  totalParticipations: 1,
  joinedEventIds: [],
  referrerName: "",
  invitedFriendsCount: 0,
  tags: ["first-time"],
  notes: "",
};

export function ParticipantsPage() {
  const { db, saveParticipantItem } = useAppData();
  const [filters, setFilters] = useState<{ query: string; segment: "all" | "first-time" | "repeat" | "has-referrer" | "invited-friends" | "inactive" }>({ query: "", segment: "all" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [form, setForm] = useState<Participant>(emptyParticipant);

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

  const openCreate = () => {
    setEditingParticipant(null);
    setForm(emptyParticipant);
    setDialogOpen(true);
  };

  const openEdit = (participant: Participant) => {
    setEditingParticipant(participant);
    setForm(participant);
    setDialogOpen(true);
  };

  const saveParticipant = async () => {
    const payload: Participant = {
      ...form,
      tags: form.tags.map((tag) => tag.trim()).filter(Boolean),
    };
    await saveParticipantItem(payload);
    setDialogOpen(false);
  };

  return (
    <div>
      <PageHeader
        eyebrow="CRM"
        title="Participant CRM"
        description="Manage participant records and save directly to Supabase from this screen."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add participant</Button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
              <Upload className="h-4 w-4" />CSV preview
              <input type="file" accept=".csv" className="hidden" onChange={(event) => handleCsv(event.target.files?.[0])} />
            </label>
          </div>
        }
      />

      <FilterBar>
        <Input placeholder="Search name, email, phone, tags" value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} className="max-w-sm" />
        <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={filters.segment} onChange={(event) => setFilters((current) => ({ ...current, segment: event.target.value as typeof filters.segment }))}>
          <option value="all">All segments</option>
          <option value="first-time">First-time</option>
          <option value="repeat">Repeat</option>
          <option value="has-referrer">Has referrer</option>
          <option value="invited-friends">Invited friends</option>
          <option value="inactive">Inactive</option>
        </select>
      </FilterBar>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="p-6">
            {participants.length === 0 ? (
              <EmptyState title="No matching participants" description="Adjust filters or add a new participant." />
            ) : (
              <DataTable
                headers={["Participant", "Participation", "Referral", "Tags", "Actions"]}
                rows={participants.map((participant) => [
                  <button key={`${participant.id}-name`} className="text-left" onClick={() => setSelectedId(participant.id)}>
                    <div className="font-medium text-slate-900">{participant.name}</div>
                    <div className="text-xs text-slate-500">{participant.email || participant.phone}</div>
                  </button>,
                  <div key={`${participant.id}-history`} className="text-sm text-slate-600">First {formatDate(participant.firstJoinDate)}<br />Latest {formatDate(participant.lastJoinDate)}<br />Total {participant.totalParticipations}</div>,
                  <div key={`${participant.id}-ref`} className="text-sm text-slate-600">Referrer {participant.referrerName || "-"}<br />Invited friends {participant.invitedFriendsCount}</div>,
                  <div key={`${participant.id}-tags`} className="flex flex-wrap gap-2">{participant.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>,
                  <Button key={`${participant.id}-edit`} variant="ghost" size="icon" onClick={() => openEdit(participant)}><Edit3 className="h-4 w-4" /></Button>,
                ])}
              />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-lg font-semibold text-slate-900">Direct input is enabled</div>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <div>Use <span className="font-medium text-slate-900">Add participant</span> to save new rows into Supabase.</div>
                <div>Use the edit button in the table to update existing participant records.</div>
                <div>CSV is still preview-only in this version. Manual entry is now connected.</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-lg font-semibold text-slate-900">CSV preview</div>
              <div className="mt-3 space-y-2 text-sm text-slate-500">
                {csvPreview.length === 0 ? <div>No CSV uploaded.</div> : csvPreview.map((line, index) => <div key={index} className="rounded-xl bg-slate-50 px-3 py-2 font-mono text-xs">{line}</div>)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <DetailDrawer open={Boolean(detail)} onClose={() => setSelectedId(null)} title={detail?.participant.name || "Participant detail"} description={detail ? `${detail.participant.email || "No email"} / ${detail.participant.phone}` : undefined}>
        {detail ? (
          <div className="space-y-6">
            <Section title="Profile">
              <div className="space-y-2 text-sm text-slate-600">
                <div>First joined: {formatDate(detail.participant.firstJoinDate)}</div>
                <div>Latest joined: {formatDate(detail.participant.lastJoinDate)}</div>
                <div>Total participations: {detail.participant.totalParticipations}</div>
                <div>Referrer: {detail.participant.referrerName || "None"}</div>
              </div>
            </Section>
            <Section title="Joined events">
              <div className="space-y-3">{detail.joinedEvents.map((event) => <div key={event.id} className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600"><div className="font-medium text-slate-900">{event.title}</div><div className="mt-1">{formatDate(event.date)} / {event.location}</div></div>)}</div>
            </Section>
            <Section title="Tags and notes">
              <div className="flex flex-wrap gap-2">{detail.participant.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
              <div className="mt-3 text-sm leading-6 text-slate-600">{detail.participant.notes || "No notes yet."}</div>
            </Section>
            <Section title="Survey comments">
              <div className="space-y-3">{detail.surveys.map((survey) => <div key={survey.id} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">Satisfaction {survey.satisfactionScore}/5 / {survey.comment}</div>)}</div>
            </Section>
          </div>
        ) : null}
      </DetailDrawer>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingParticipant ? "Edit participant" : "Add participant"}</DialogTitle>
            <DialogDescription>Save participant information directly into Supabase.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            <Input placeholder="Email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            <Input placeholder="Phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
            <Input placeholder="Referrer name" value={form.referrerName} onChange={(event) => setForm((current) => ({ ...current, referrerName: event.target.value }))} />
            <Input type="date" value={form.firstJoinDate} onChange={(event) => setForm((current) => ({ ...current, firstJoinDate: event.target.value }))} />
            <Input type="date" value={form.lastJoinDate} onChange={(event) => setForm((current) => ({ ...current, lastJoinDate: event.target.value }))} />
            <Input type="number" placeholder="Total participations" value={form.totalParticipations} onChange={(event) => setForm((current) => ({ ...current, totalParticipations: Number(event.target.value) }))} />
            <Input type="number" placeholder="Invited friends" value={form.invitedFriendsCount} onChange={(event) => setForm((current) => ({ ...current, invitedFriendsCount: Number(event.target.value) }))} />
            <Input className="md:col-span-2" placeholder="Tags, comma separated" value={form.tags.join(", ")} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value.split(",") }))} />
          </div>
          <Textarea className="mt-3" placeholder="Notes" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => void saveParticipant()}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
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
