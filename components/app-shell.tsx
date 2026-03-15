"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, Calculator, ClipboardList, LayoutDashboard, NotebookPen, Sparkles, Users } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Core metrics" },
  { href: "/events", label: "Events", icon: Sparkles, description: "Operations and hypotheses" },
  { href: "/participants", label: "Participants CRM", icon: Users, description: "Retention tracking" },
  { href: "/calendar", label: "Calendar", icon: CalendarDays, description: "Run-of-show" },
  { href: "/tasks", label: "Tasks", icon: ClipboardList, description: "Execution board" },
  { href: "/meeting-notes", label: "Meeting Notes", icon: NotebookPen, description: "Decision log" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, description: "Experiment results" },
  { href: "/fee-calculator", label: "Fee Calculator", icon: Calculator, description: "Pricing model" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(201,171,126,0.35),_transparent_28%),linear-gradient(180deg,#f8f4ed_0%,#f2ede5_45%,#eef1ec_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:px-6">
        <aside className="hidden w-[290px] shrink-0 rounded-[2rem] border border-white/60 bg-[#183028] p-5 text-white shadow-2xl lg:flex lg:flex-col">
          <div className="mb-8 flex items-center gap-3 rounded-3xl bg-white/8 p-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#d7b07a] text-lg font-bold text-[#183028]">GC</div>
            <div>
              <div className="font-semibold">Gathering CRM</div>
              <div className="text-sm text-white/70">University marketing club ops dashboard</div>
            </div>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className={cn("flex items-start gap-3 rounded-2xl px-4 py-3 transition", active ? "bg-white text-slate-900 shadow-lg" : "text-white/75 hover:bg-white/8 hover:text-white")}>
                  <Icon className="mt-0.5 h-4 w-4" />
                  <div>
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className={cn("text-xs", active ? "text-slate-500" : "text-white/55")}>{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto rounded-3xl bg-white/8 p-4 text-sm text-white/75">
            <div className="font-medium text-white">Operating loop</div>
            <div className="mt-2 leading-6">Plan / Hypothesis / Run / Survey / Review / Improve</div>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}

