import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui";

export function StatCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
            <div className="mt-2 text-sm text-slate-500">{helper}</div>
          </div>
          <div className="rounded-2xl bg-[#f3eadb] p-2 text-[#8a6d47]">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

