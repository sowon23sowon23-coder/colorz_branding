"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useAppData } from "@/components/app-data-provider";
import { ChartCard } from "@/components/chart-card";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Badge, Button, Card, CardContent } from "@/components/ui";
import { getDashboardSnapshot } from "@/lib/repository";
import { formatDate, formatMonth } from "@/lib/utils";

export function DashboardPage() {
  const { db } = useAppData();
  const snapshot = getDashboardSnapshot(db);

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Gathering operations dashboard"
        description="Track event metrics, participant retention, hypothesis outcomes, and post-event signals in one place."
        actions={<Button variant="secondary">Share weekly ops snapshot</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {snapshot.stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <ChartCard title="Monthly participant trend" description="Last six months of participant and event flow">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={snapshot.monthlyTrends.map((item) => ({ ...item, label: formatMonth(item.month) }))}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="participants" stroke="#1f3b2f" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="events" stroke="#c59c64" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <Card>
          <CardContent className="space-y-4 p-6">
            <div>
              <div className="text-sm text-slate-500">Upcoming event</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950">{snapshot.upcomingEvent?.title ?? "No event scheduled"}</div>
              <div className="mt-2 text-sm text-slate-500">{snapshot.upcomingEvent ? `${formatDate(snapshot.upcomingEvent.date)} · ${snapshot.upcomingEvent.location}` : ""}</div>
            </div>
            <div className="rounded-[1.5rem] bg-[#f6efe3] p-4 text-sm leading-6 text-slate-700">
              <div className="font-medium text-slate-900">Latest meeting note</div>
              <div className="mt-2">{snapshot.recentMeetingNote?.title}</div>
              <div className="mt-2 text-slate-500">{snapshot.recentMeetingNote?.content}</div>
            </div>
            <div className="rounded-[1.5rem] bg-[#183028] p-4 text-sm text-white">
              <div className="font-medium">Ops focus</div>
              <div className="mt-2 text-white/75">Keep the loop tight between hypotheses, survey feedback, and next-event planning.</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ChartCard title="Participants by event" description="Actual attendance comparison">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={snapshot.participantsByEvent} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis type="number" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="label" width={110} stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#c59c64" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Average satisfaction trend" description="Events with survey responses">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={snapshot.satisfactionTrend}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis domain={[0, 5]} stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#1f3b2f" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard title="Recent events" description="Latest event health and delivery">
          <DataTable
            headers={["Event", "Date", "Status", "Target/Actual", "Owner"]}
            rows={snapshot.recentEvents.map((event) => [
              <div key={`${event.id}-title`}>
                <div className="font-medium text-slate-900">{event.title}</div>
                <div className="text-xs text-slate-500">{event.type}</div>
              </div>,
              formatDate(event.date),
              <Badge key={`${event.id}-badge`} variant={event.status === "analyzed" ? "success" : event.status === "completed" ? "info" : "warning"}>{event.status}</Badge>,
              `${event.targetParticipants} / ${event.actualParticipants}`,
              event.owner,
            ])}
          />
        </ChartCard>

        <div className="space-y-6">
          <ChartCard title="Recent tasks" description="Upcoming operational work">
            <div className="space-y-3">
              {snapshot.recentTasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-slate-900">{task.title}</div>
                    <Badge variant={task.status === "done" ? "success" : task.status === "in-progress" ? "warning" : "default"}>{task.status}</Badge>
                  </div>
                  <div className="mt-2 text-sm text-slate-500">{task.assignee} · {formatDate(task.dueDate)}</div>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Quick insights" description="Mock-data driven planning signals">
            <div className="space-y-3">
              {snapshot.insights.map((insight) => (
                <div key={insight.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-slate-900">{insight.title}</div>
                    <Badge variant={insight.tone === "positive" ? "success" : insight.tone === "warning" ? "warning" : "default"}>{insight.tone}</Badge>
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-500">{insight.description}</div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
